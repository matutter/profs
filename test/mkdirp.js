var pro = require('..')
var assert = require('assert')

var file = 'test/folder'

try {
	pro.mkdirp(file)
	.then(e => {
		assert(e == null, 'Unexpected value: '+JSON.stringify(e))
	})
	.catch(e => {
		console.error(e)
	})
} catch(e) {
	console.error(e)
}