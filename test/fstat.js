var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var file1 = dir+'/f1.txt'
var file2 = dir+'/f2.txt'
var data = 'data data data data'
var fd1 = null
var fd2 = null

describe('setup', ()=> {
  it('should make a "files" directory with a file inside', ()=> {
    fs.mkdirSync(dir)
  })
  it('should write a file and open a fd', ()=> {
    fs.writeFileSync(file1, data)
    fd1 = fs.openSync(file1, 'r')
    fd2 = fd1+1
  })
})

describe('fstat', ()=> {
  describe("on invalid fd", ()=> {
    it('should throw EBADF', ()=> {
      var promise = pro.fstat(fd2).catch(e=>e.code)
      return assert.eventually.equal(promise, 'EBADF')
    })
  })
  describe("on an open fd", ()=> {
    it("should return fs.stats with a path property", ()=> {
      var promise = pro.fstat(fd1).then(s=>s.fd)
      return assert.eventually.equal(promise, fd1)
    })
  })
})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
    fs.unlinkSync(file1)
    fs.rmdirSync(dir)
  })
})
