const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')

Promise.promisifyAll(fs)

module.exports = fs
module.exports.walk = walk
module.exports.mkdirp = mkdirp
module.exports.File = File

/**
* The file object contains the dirname, basename, children, isFile or isDirectory value, and a stat() function.
* @typedef File
* @param filepath - File path
* @return Promise
* @promise.resolve - This reference is produced after fs.stat is complete
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

/**
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

function defaultWalkCallback(child, parent) {
	if(parent)
		parent.children.push(child)
	child.parent = parent
}

/**
* Will walk a file hierarchy and create an Object representation of it.
* If options are used 'filter' may be optional to trigger on all files be default.
* If options.onFile or onDirectory are used the root promise may return undefined.
* @param root - The root path to begin the file-walk
* @param opts - Options for specifying filter and/or onFile & onDirectory handlers
* @param opts.filter - Function which must return truthy values to allow a directory or file to trigger handler.
* @param opts.onFile - Function which may return a promise to be included in root promissory chain, called each non-directory.
* @param opts.onDirectory - Function which may return a promise to be included in root promissory chain, called on each directory.
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
* @param filepath - Path of directory to create
* @return Promise
* @promise.resolve - null
* @promise.reject - Any error other than fs.ENOENT or fs.EEXIST
*/
function mkdirp(filepath) {
	const dirs = path.normalize(filepath).split(path.sep)
	var make_remaining = false 
	return fs.accessAsync(filepath).catch(e => {
		allowENOENT(e)
		return Promise.reduce(dirs, (parent, child) => {

			var next = Promise.resolve(path.join(parent, child))

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