var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var closed_file = './test/files/unlink.txt'
var open_file_name = 'unlink2.txt'
var open_file = './test/files/' + open_file_name

var open_fd = null

describe('setup', ()=> {
  it('should make a "files" directory', ()=> {
    fs.mkdirSync(dir)
  })
  it('should make a r+w file', ()=> {
    var fd = fs.openSync(closed_file, 'w')
    fs.writeSync(fd, 'closed file data', 0, 'utf8')
    fs.closeSync(fd)

    open_fd = fd = fs.openSync(open_file, 'w')
    fs.writeSync(fd, 'open file data never closes', 0, 'utf8')
    //fs.closeSync(fd)
  })
})


describe('unlink', ()=> {

  describe('on a closed file', ()=> {
    it('should delete it', ()=> {
      var promise = pro.unlink(closed_file)
      return assert.eventually.equal(promise, null)
    })
  })

  describe('on an open file', ()=> {
    it('should delete it', ()=> {
      var promise = pro.unlink(open_file).then(()=> {
        return ~fs.readdirSync(dir).indexOf(open_file_name)
      })
      return assert.eventually.equal(promise, false)
    })
  })

  describe('on a directory', ()=> {
    it('should throw EISDIR', ()=> {
      return assert.eventually.equal(pro.unlink(dir).catch(e=>e.code), 'EISDIR')
    })
  })

})

describe('cleanup', ()=> {
  it('should remove the "files" directory', ()=> {
    fs.rmdirSync(dir)
  })
})
