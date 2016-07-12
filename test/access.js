var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var filename = './test/files/access.txt'
var ENOENT_filename = './test/files/missing.txt'


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

  describe('on a file that doesn\'t exist', ()=> {
    it('should throw ENOENT', ()=> {
      var p = pro.access(ENOENT_filename).catch(e => e.code)
      return assert.eventually.equal(p, "ENOENT")
    })
  })

})

describe('cleanup', ()=> {
  it('should remove the r+w file', ()=> {
    fs.unlinkSync(filename)
  })
  it('should remove "files" folder', ()=> {
    fs.rmdirSync(dir)
  })
})