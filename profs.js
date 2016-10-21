const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')

Promise.promisifyAll(fs)

module.exports = fs
module.exports.walk = walk
module.exports.mkdirp = mkdirp
module.exports.touch = touch
module.exports.removerf = removerf
module.exports.File = File

/**
* The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.
* @typedef File
* @param {String =} filepath Path to file
* @param {String =} dirname The parent directories path or name
* @param {String =} basename This files basename
* @return {Promise} Will resolve a `this` reference after fs.stat is complete
*/
function File(filepath, dirname, basename) {
	if(!filepath) {
		this.dirname = dirname
		this.basename = basename
		this.path = path.join(dirname, basename)
	} else {
		this.dirname = path.dirname(filepath)
		this.basename = path.basename(filepath)
		this.path = filepath		
	}

	this.children = []
	this.stat = null
	this.parent = null

	return fs.statAsync(this.path)
		.then(stat => {
			this.stat = () => stat
			if(stat.isFile())
				this.isFile = true
			else if(stat.isDirectory())
				this.isDirectory = true
		})
		.return(this)
}

/**
* Iterates a callback over all children, if the callback produces a promise it will resolve
* before subsequent children are iterated over.    
* 
* If the `leaves_first` parameter is truthy the callback will iterate over the tree in a leaf-to-root direction.
*
* @param {Function} fn Function to accept a File. If it returns a promise it will be included in the File.each promissory chain.
* @param {Boolean} leaves_first If true will iterate over files from the bottom-up.
*/
File.prototype.each = function(fn, leaves_first) {
	if(leaves_first) {
		return Promise.map(this.children, child => child.each(fn, leaves_first))
			.then(() => Promise.try(()=>fn(this)))
	} else {
		return Promise.try(()=>fn(this))
			.then(() => Promise.map(this.children, child => child.each(fn, leaves_first)))
	}
};

/**
* Flattens all File nodes into a single flat array.
* @param {Function =} filter A _filter function_ for which Files to include in the flattened array.
* @return {Array} Flat array of all children of the File node.
*/
File.prototype.flatten = function(filter) {
	return flatten(this, filter)
};

function flatten(node, filter) {
	const flat = []
	var nodes = [node]
	var index = 0

	if(filter) {
		do {
			node = nodes[index++]
			nodes = nodes.concat(node.children)
			if(!filter(node)) continue
			flat.push(node)
		} while(index < nodes.length)
	} else {
		do {
			node = nodes[index++]
			flat.push(node)
			nodes = nodes.concat(node.children)
		} while(index < nodes.length)
	}

	return flat
}

function allowENOENT(e) {
	if(e.code !== 'ENOENT') throw e
	return null
}

function allowEEXIST(e) {
	if(e.code !== 'EEXIST') throw e
	return null
}

function isFunc(f) {
	return typeof f === 'function'
}

/*!
* Walks the file tree creates a tree of File objects, returns root
*/
function walk_internal(child, parent, opts) {
	return Promise.resolve(child).then(file => {

		if(file.isDirectory) {
			return Promise.try(() => opts.filter.directory(file)).then(filter => {
				if(!filter) {
					return null
				}

				return Promise.try(() => opts.onDirectory(file, parent))
					.then(() => fs.readdirAsync(file.path))
					.then(children => Promise.map(children, child => new File(null, file.path, child)))
					.then(children => Promise.map(children, child => walk_internal(child, file, opts)))
					.return(file)
			})
		} else {
			return Promise.try(() => opts.filter.file(file)).then(filter => {
				if(!filter) {
					return null
				}

				return Promise.try(() => opts.onFile(file, parent, opts)).return(file)
			})
		}
	})
}

/*!
* Method used to aggregate the File tree structure.
* Assigns the parent (if present) to the child and the child to the parent's children.
* @param {File} child Child File
* @param {File} parent Parent File or null
*/
function defaultWalkCallback(child, parent) {
	if(parent)
		parent.children.push(child)
	child.parent = parent
}

function defaultWalkFilter(file) {
	return true
}

/**
* Walk will recursively walk a directory structure creating a _file tree_ as it progresses.
*	The _file tree_ is a composite of _"nodes"_ where each node is a `File` object and may be traversed by the `File.children` property;
*	`File.children` is an array of `File` objects.    
* 
* Walk will return the _root_ node once the promised is fulfilled.    
*	
* `options.filter` is a _filter function_ on each node which determines if a node will be included, or excluded, from the _file tree_.
* The filter option may also be an object with a `file` and `directory` filter function such as `{ file: f=>true, directory: d=>true }`;
* These explicit _filter functions_ are passed either only files or directories respectively.    
*
* The `onFile` and `onDirectory` functions are _handler_ functions which are pass the file or directory, the parent directory, and the options passed to
* the _walk_ function (if any).        
*
* The `filter`, if truthy, will flatten the _file tree_ before it is returned. This may also be a _filter function_ to return only specific Files.    
*
*	The promissory chain will wait for all `filter`, `onFile`, `onDirectory` callbacks to finish if they return a promise; returning a promise is not necessary.
*
* @param {String} root The root path to begin the file-walk
* @param {{filter: Function | {file: Function, directory: Function =}, onFile: Function, onDirectory: Function} =} opts Options for specifying filter and/or onFile & onDirectory handlers.
*		`filter` Function which must return truthy values to allow a directory or file to trigger handler.
* 	`onFile` Function which may return a promise to be included in root promissory chain, called each non-directory.
* 	`onDirectory` Function which may return a promise to be included in root promissory chain, called on each directory.
* @return {Promise} Resolves a File tree, navigable from root to leaf by the File.children property
*/
function walk(root, opts) {

	if(!opts) opts = {}

	var flatten_filter = null

	if(opts.flatten && isFunc(opts.flatten))
		flatten_filter = opts.flatten

	if(!opts.onFile) {
		opts.onFile = defaultWalkCallback
	} else {
		if(!isFunc(opts.onFile)) throw new Error('Expected onFile to be a function')
	}

	if(!opts.onDirectory) {
		opts.onDirectory = defaultWalkCallback
	} else {
		if(!isFunc(opts.onDirectory)) throw new Error('Expected onDirectory to be a function')
	}

	if(!opts.filter) { 
		opts.filter = {
			file: defaultWalkFilter,
			directory: defaultWalkFilter
		}
	} else {
		if(isFunc(opts.filter)) {
			const filter = opts.filter
			opts.filter = {
				file: filter,
				directory: filter
			}
		} else {
			if(!opts.filter.file) {
				opts.filter.file = defaultWalkFilter
			} else if(!isFunc(opts.filter.file)) throw new Error('Expected filter.file to be a function')

			if(!opts.filter.directory) {
				opts.filter.directory = defaultWalkFilter
			} else if(!isFunc(opts.filter.directory)) throw new Error('Expected filter.directory to be a function')
		}
	}

	return walk_internal(new File(root), null, opts)
		.then(tree => tree ? tree : Promise.reject(new Error('No files met criteria')))
		.then(tree => opts.flatten ? tree.flatten(flatten_filter) : tree)
}

/**
* Creates all non-existing directories in a root-to-leaf direction after checking if the leaf doesn't exist.
* The root promise should be fulfilled in a race-tolerant way ( EEXIST are allowed after an ENOENT )
* 
* @param {String} filepath Path of directory to create
* @return {Promise} Will resolve `null` on success else rejected with any error other than fs.ENOENT or fs.EEXIST
*/
function mkdirp(filepath) {
	const dirs = path.normalize(filepath).split(path.sep)
	var make_remaining = false 
	return fs.accessAsync(filepath).catch(e => {
		allowENOENT(e)
		return Promise.reduce(dirs, (parent, child) => {

			const next = Promise.resolve(path.join(parent, child))

			if(make_remaining)
				return fs.mkdirAsync(parent)
					.catch(allowEEXIST)
					.return(next)

			return fs.accessAsync(parent).catch(e => {
					allowENOENT(e)
					make_remaining = true
					return fs.mkdirAsync(parent)
				})
				.catch(allowEEXIST)
				.return(next)
		}).then(filepath => fs.mkdirAsync(filepath))
			.catch(allowEEXIST)
	})
}

/**
* Creates a file if it does not exist by opening it with 'a+', or truncating it with 'w+' when the truncate flag is truthy.
*	Will fail if the file cannot be read or written to (EACCESS) or is an existing directory (EISDIR).
*	@param {String | Buffer} path Path to file to create.
*	@param {Boolean =} truncate (optional) If true the file will be truncated if it exists. Default is false.
* @param {Integer =} mode (optional) Sets the sticky bits for the file if it doesn't exist. Default is 0666.
*/
function touch(filepath, truncate, mode) {
	truncate = truncate || false
	mode = mode || '0666'
	const flags = truncate ? 'w+' : 'a+'
	return fs.openAsync(filepath, flags, mode).then(fs.closeAsync.bind(fs))
}


const removerf_options = {
	filter: {
		file: defaultWalkFilter,
		directory: defaultWalkFilter
	},
	onDirectory: defaultWalkCallback,
	onFile : file => fs.unlinkAsync(file.path),
	flatten : file => file.isDirectory
}

/**
* Recursively removes all files and folders.    
* Files will be unlinked, and directories are deleted with rmdir from leaf to root.
* @param {String} filepath Path to file or directory to remove.
* @return {none} Null of success else rejected.
*/
function removerf(root) {
	return walk_internal(new File(root), null, removerf_options)
		.then(root => {
			if(root.isFile) return 
			return root.each(file => fs.rmdirAsync(file.path), true)			
		})
		.return(null)
}