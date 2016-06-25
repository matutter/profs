const q = require('q')
const fs = require('fs')
const p = require('path')

/* make node modules available */
module.exports.fs = fs

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

function mkdirp(path, mode) {
	var d = q.defer()
	fs.access(path, mode, e => {
		if(e) {
			if(e.code === 'ENOENT')	{
				mkdirp(p.dirname(path,mode))
				.then(mkdir(path,mode))
				.then(d.resolve(null))
			} else {
				d.reject(e)
			}
		} else {
			d.resolve(mkdir(path, mode))
		}
	})
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