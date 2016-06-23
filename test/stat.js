var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var file1 = dir+'/f1.txt'
var file2 = dir+'/f2.txt'
var data = 'data data data data'

describe('setup', ()=> {
  it('should make a "files" directory with a file inside', ()=> {
    fs.mkdirSync(dir)
  })
  it('should write a file and open a fd', ()=> {
    fs.writeFileSync(file1, data)
  })
})

describe('stat', ()=> {
  describe("on a file that doesn't exist", ()=> {
    it('should throw ENOENT', ()=> {
      var promise = pro.stat(file2).catch(e=>e.code)
      return assert.eventually.equal(promise, 'ENOENT')
    })
  })
  describe("on an existing file", ()=> {
    it("should return fs.stats with a path property", ()=> {
      var promise = pro.stat(file1).then(s=>s.path)
      return assert.eventually.equal(promise, file1)
    })
  })
})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
    fs.unlinkSync(file1)
    fs.rmdirSync(dir)
  })
})
