var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var file1 = dir+'/f1.txt'
var file2 = dir+'/f2.txt'

var fd1 = null
var fd2 = null

describe('setup', ()=> {
  it('should make a "files" directory with a file inside', ()=> {
    fs.mkdirSync(dir)
  })
  it('should write a file and open a fd', ()=> {
    fs.writeFileSync(file1, 'data data data')
		fd1 = fs.openSync(file1, 'r')
    fd2 = fd1+1
  })
})

describe('close', ()=> {
  describe("on a fd that isn't open", ()=> {
    it('should throw EBADF', ()=> {
			var promise = pro.close(fd2).catch(e=>e.code)
      return assert.eventually.equal(promise, 'EBADF')
    })
  })
  describe("on a valid fd", ()=> {
    it("should return null", ()=> {
      return assert.eventually.equal(pro.close(fd1), null)
    })
  })
})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
	  fs.unlinkSync(file1)
		fs.rmdirSync(dir)
  })
})
