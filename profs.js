const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')

Promise.promisifyAll(fs)

module.exports = fs
module.exports.walk = walk
module.exports.mkdirp = mkdirp
module.exports.touch = touch
module.exports.File = File

/**
* The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.
* @typedef File
* @param {String} filepath Path to file
* @return {Promise} Will resolve a `this` reference after fs.stat is complete
*/
function File(filepath) {
	this.dirname = path.dirname(filepath)
	this.basename = path.basename(filepath)
	this.path = filepath
	this.children = []
	this.stat = null

	this.parent = null

	return fs.statAsync(this.path)
		.then(stat => {
			this.stat = () => stat
			if(stat.isFile())
				this.isFile = true
			if(stat.isDirectory())
				this.isDirectory = true
		})
		.return(this)
}

/**
* Flattens all File nodes into a single flat array.
* @param {Array} flat Should not be used
* @return {Array} Flat array of all children of the File node.
*/
File.prototype.flatten = function(flat) {
	flat = flat || [this]
	flat = flat.concat(this.children)
	this.children.forEach(child => child.flatten(flat))
	return flat
};

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
		if(!opts.filter(file)) return Promise.resolve(file)

		if(file.isDirectory) return Promise.resolve(opts.onDirectory(file, parent))
				.then(() => fs.readdirAsync(file.path))
				.then(children => Promise.map(children, child => {
					var filepath = path.join(file.path, child)
					return new File(filepath)
				}))
				.then(children => Promise.map(children, child => walk_internal(child, file, opts)))
				.return(file)

		else return Promise.resolve(opts.onFile(file, parent, opts))
				.return(file)
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

/**
* Walk will recursively walk a directory structure creating a _file tree_ as it progresses.
*	The _file tree_ is a composite of _"nodes"_ where each node is a `File` object and may be traversed by the `File.children` property;
*	`File.children` is an array of `File` objects.    
* 
* Walk will return the _root_ node once the promised is fulfilled.    
*	
* `options.filter` is a _filter function_ on each node which determines if a node will be included, or excluded, from the _file tree_.
*	The promissory chain will wait for all `filter`, `onFile`, `onDirectory` callbacks to finish if they return a promise.
* @param {String} root The root path to begin the file-walk
* @param {Object} opts Options for specifying filter and/or onFile & onDirectory handlers
* @param {Function} opts.filter Function which must return truthy values to allow a directory or file to trigger handler.
* @param {Function} opts.onFile Function which may return a promise to be included in root promissory chain, called each non-directory.
* @param {Function} opts.onDirectory Function which may return a promise to be included in root promissory chain, called on each directory.
* @return {Promise} Resolves a File tree, navigable from root to leaf by the File.children property
*/
function walk(root, opts) {

	if(!opts) opts = {}

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
		opts.filter = () => true
	} else {
		if(!isFunc(opts.filter)) throw new Error('Expected filter to be a function')
	}

	return walk_internal(new File(root), null, opts)
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
* Creates a file if it does not exist.
*	Will fail if file exists and cannot be read or written to (EACCESS).
*	@param {String | Buffer} path Path to file to create.
*	@param {Boolean} truncate (optional) If true the file will be truncated if it exists. Default is false.
* @param {Integer} mode (optional) Sets the sticky bits for the file if it doesn't exist. Default is 0666.
*/
function touch(filepath, truncate, mode) {
	truncate = truncate || false
	mode = mode || '0666'
	const flags = truncate ? 'w+' : 'a+'
	return fs.openAsync(filepath, flags, mode).then(fs.closeAsync.bind(fs))
}