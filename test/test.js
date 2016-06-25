const pro = require('../profs.js')
const q = require('q')

var files = ['file0.txt', 'file1.css']
var dirs = ['./dir0', './dir1']
var nesteddirs = ['./dir0/dir2', './dir1/dir3', './dir0/dir4']
var all = files.concat(dirs).concat(nesteddirs)

function mkdirTEST(x) {
	return pro.mkdir(x)
	.then(e=>console.log('PASS', "mkdir", x))
	.catch(e=>console.error('FAIL', 'mkdir', x))
}

function mkdirpTEST(x) {
	return pro.mkdirp(x)
	.then(e=>console.log('PASS', "mkdirp", x))
	.catch(e=>console.error('FAIL', 'mkdirp', x))
}

function unlinkTEST(x) {
	return pro.unlink(x)
	.then(e=>console.log('PASS', "unlink", x))
	.catch(e=>console.error('FAIL', 'unlink', x))
}

function rmdirTEST(x) {
	return pro.rmdir(x)
	.then(e=>console.log('PASS', "rmdir", x))
	.catch(e=>console.error('FAIL', 'rmdir', x))
}

function touchTEST(x) {
	return pro.touch(x)
	.then(e=>console.log('PASS', "touch", x))
	.catch(e=>console.error('FAIL', 'touch', x, e))
}

function fstatTEST(fd_promise) {
	return fd_promise.then(fd => {
		return pro.fstat(df)
			.then(e=>console.log('PASS', "fstat", x))
			.catch(e=>console.error('FAIL', 'fstat', x, e))
	})
}

function openTEST(x) {
	return pro.open(x, 'w')
		.then( fd => {
			console.log('PASS', "open", x)
			return fd
		})
		.catch(e=>console.error('FAIL', 'open', x, e))
}

function closeTEST(x) {
	try {
		return pro.close(x)
			.then(e=>console.log('PASS', "close", x))
			.catch(e=>console.error('FAIL', 'close', x, e))
	} catch(e) {
		console.error(e)
	}
}

q.all(dirs.concat(nesteddirs).map(mkdirTEST))
.then(e=>q.all(nesteddirs.map(rmdirTEST)))
.then(e=>q.all(dirs.map(rmdirTEST)))
.then(e=>q.all(files.map(touchTEST)))
.then(e=>q.all(files.map(unlinkTEST)))
.then(e=>q.all(files.map(openTEST)))
.then(fds => q.all(fds.map(closeTEST)))
.then(e=>q.all(files.map(unlinkTEST)))
.catch(console.error)