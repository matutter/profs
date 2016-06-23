const q = require('q')
const fs = require('fs')
const p = require('path')

function dummy() {}

/* make node modules available */
module.exports.fs = fs
module.exports.F_OK = fs.F_OK
module.exports.R_OK = fs.R_OK
module.exports.W_OK = fs.W_OK
module.exports.X_OK = fs.X_OK

function access(path, mode) {
	var d = q.defer()
	fs.access(path, mode, e =>
		e
		? d.reject(e)
		: d.resolve(null)
	)
	return d.promise
}

module.exports.access = access

function mkdir(path, mode) {
	var d = q.defer()
	fs.mkdir(path, mode || 0o777, e =>
		e
		? d.reject(e)
		: d.resolve(path) // because handler wont have to check for error
	)
	return d.promise
}

module.exports.mkdir = mkdir

function mkdirp_mkdir(path, mode) {
	var d = q.defer()
	fs.mkdir(path, mode, e => 
		e && e.code !== 'EEXIST'
		? d.reject(e)
		: d.resolve(null)
	)
	return d.promise
}

function mkdirp_internal(path, prev, mode, defer, paths) {
	// if there is no valid root or other issue
	if(path === prev) return access(prev)
	.then( () => defer.reject('Cannot create directory in ' + paths.pop()))
	.catch( e => defer.reject(e) )
	
	fs.access(path, mode, e => {
		if(e) {
			if(e.code === 'ENOENT') {
				paths.push(path)
				mkdirp_internal(p.dirname(path), path, mode, defer, paths)
			} else {
				defer.reject(e)
			}
		} else {
			if(!paths.length) return defer.resolve(null)
			paths.push(mkdirp_mkdir(paths.pop(), mode))
			defer.resolve(paths.reduceRight((parent, child) => 
				parent.then(e => mkdirp_mkdir(child, mode))
			))
		}
	})
}

function mkdirp(path, mode) {
	var d = q.defer()
	mkdirp_internal(p.resolve(path), null, mode, d, [])
	return d.promise
}

module.exports.mkdirp = mkdirp

function unlink(path) {
	var d = q.defer()
	fs.unlink(path, e =>
		e
		? d.reject(e)
		: d.resolve(null)
	)
	return d.promise
}

module.exports.unlink = unlink

function rmdir(path) {
	var d = q.defer()
	fs.rmdir(path, e =>
		e
		? d.reject(e)
		: d.resolve(null)
	)
	return d.promise
}

module.exports.rmdir = rmdir

function open(path, flags, mode) {
	var d = q.defer()
	fs.open(path, flags || 'r', mode || '0666', (e, fd) =>
		e
		? d.reject(e)
		: d.resolve(fd)
	)
	return d.promise
}

module.exports.open = open

function close(fd) {
	var d = q.defer()
	fs.close(fd, e =>
		e
		? d.reject(e)
		: d.resolve(null)
	)
	return d.promise
}

module.exports.close = close

function touch(path) {
	return open(path, 'w').then(fd => close(fd))
}

module.exports.touch = touch

function stat(path) {
	var d = q.defer()
	fs.stat(path, (e, stats) =>
		e
		? d.reject(e)
		: d.resolve((stats.path = path) && stats)
	)
	return d.promise
}

module.exports.stat = stat

function fstat(fd) {
	var d = q.defer()
	fs.fstat(fd, (e, stats) =>
		e
		? d.reject(e)
		: d.resolve((stats.fd = fd) && stats)
	)
	return d.promise
}

module.exports.fstat = fstat

/** options are omitted */
function readdir(path, options) {
	var d = q.defer()
	fs.readdir(path, (e, files) =>
		e
		? d.reject(e)
		: d.resolve(files)
	)
	return d.promise
}

module.exports.readdir = readdir

/**
 * A call to readdir followed by fs.stat on all files
 */
function readdirStat(path, options) {
	return readdir(path, options)
	.then(files => q.all(files
		.map(file => p.join(path, file))
		.map(file => stat(file).then(stat => {
			stat.path = file
			return stat
		}))
	))
}

module.exports.readdirStat = readdirStat

const walkCallbacks = {
	onDirectory : function() {},
	onFile : function() {}
}

function walk_accumulator(keep_stats) {
	this.files = []
	this.directories = []
	this.keep_stats = keep_stats || false
}

walk_accumulator.prototype.onFile = function(file) {
	this.files.push(this.keep_stats ? file : file.path)
};

walk_accumulator.prototype.onDirectory = function(file) {
	this.directories.push(this.keep_stats ? file : file.path)
};

function walk_internal(path, cbs) {
	return readdirStat(path)
	.then(files => q.all(files.map(file => {
		if(file.isDirectory()) {
			cbs.onDirectory(file)
			return walk_internal(file.path, cbs)
		} else {
			cbs.onFile(file)
		}
	})))
}

/**
 * options
 * <boolean> stat If true returns a fs.stat object with a .path property, else the path is returned
 * <boolean> toArray If true onFile and onDirectory are ignored and the promise resolves to an object with {directories: [], files:[]} where the far end of the arrays containing the bottom on the file tree
 * <function> onFile If provided this callback receives all files
 * <function> onDirectory If provided this callback receives all directories
 * toArray takes president over onFile and onDirectory
 */
function walk(path, cbs) {
	var promise = null

	if(cbs.toArray) {
		var accum = new walk_accumulator(cbs.stat)
		promise = walk_internal(path, accum)
		.then( () => accum )
	} else if(!(cbs.onFile || cbs.onDirectory)) {
		return q(null)
	} else {
		promise = walk_internal(path, cbs)
	}

	cbs = Object.assign(walkCallbacks, cbs)

	return promise
}

module.exports.walk = walk

/**
 * Walks the file structure from the top down removing files and folders from the bottom up.
 * Must be called on a directory
 */
function removerf(path) {
	return walk(path, { toArray: true, stat:true })
	.then(res => {
		var sequence = res.directories.concat(res.files)
		sequence.push(q(null))
		return sequence.reduceRight((a,b) => {
			return a.then( () => {
				if(b.isFile())
					return unlink(b.path)
				else
					return rmdir(b.path)
			})
		})	
	}).then(() => rmdir(path))
}

module.exports.removerf = removerf

function readFile(path, options) {
  var d = q.defer()
  fs.readFile(path, options || {encoding:null, flags:'r'}, (e,data) => {
    e
    ? d.reject(e)
    : d.resolve(data)
  })
  return d.promise
}

module.exports.readFile = readFile

function readFileUtf8(path) {
  return readFile(path, 'utf8')
}

module.exports.readFileUtf8 = readFileUtf8
