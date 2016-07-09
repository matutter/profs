var pro = require('..')
var assert = require('assert')

var file = 'test/folder'

module.exports.test = function() {
	return pro.mkdirp(file)
	.then(e => {
		assert(e == null, e)
	})
}