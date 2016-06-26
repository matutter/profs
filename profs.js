const q = require('q')
const fs = require('fs')
const p = require('path')

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
		: d.resolve(null)
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

function mkdirp_internal(path, mode, defer, paths) {
	fs.access(path, mode, e => {
		if(e) {
			if(e.code === 'ENOENT') {
				paths.push(path)
				mkdirp_internal(p.dirname(path), mode, defer, paths)
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
	mkdirp_internal(p.resolve(path), mode, d, [])
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
	fs.open(path, flags, mode, (e, fd) =>
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
		: d.resolve(stats)
	)
	return d.promise
}

module.exports.stat = stat

function fstat(path) {
	var d = q.defer()
	fs.fstat(path, (e, stats) =>
		e
		? d.reject(e)
		: d.resolve(stats)
	)
	return d.promise
}

module.exports.fstat = fstat

function readdir(path, options) {
	var d = q.defer()
	fs.readdir(path, options, (e, files) =>
		e
		? d.reject(e)
		: d.resolve(files)
	)
	return d.promise
}

module.exports.readdir = readdir

function readdirStat(path, options) {
	return readdir(path, options).then( files => 
		q.all(files.map(filename => p.join(path, filename))
		.map(stat))
	)
}

module.exports.readdirStat = readdirStat