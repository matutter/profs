var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './files'
var filename = './files/access.txt'

describe('setup', ()=> {
  it('should make a "files" folder', ()=> {
    fs.mkdirSync(dir)
  })
  it('should make a r+w file', ()=> {
    var fd = fs.openSync(filename, 'w')
    fs.writeSync(fd, 'test data', 0, 'utf8')
    fs.closeSync(fd)

  })
})


describe('access', ()=> {
  describe('without options', ()=> {
    it('should default to R_OK', ()=> {
	return assert.eventually.equal(pro.access(filename), null)
    })
  })
})


