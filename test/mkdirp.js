var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var nested = './test/files/nested/nested/nested'

describe('setup', ()=> {
  it('should make a "files" directory with a file inside', ()=> {
    fs.mkdirSync(dir)
  })
})

describe('mkdirp', ()=> {
  describe("on a file that exists", ()=> {
    it('should return null', ()=> {
      var promise = pro.mkdirp(dir).catch(e=>e.code)
      return assert.eventually.equal(promise, null)
    })
  })
  describe("on a directory with missing path parts", () => {
    it("should make each directroy in path, return null", ()=> {
      return assert.eventually.equal(pro.mkdirp(nested), null)
    })
  })
})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
    return assert.eventually.equal(pro.removerf(dir), null)
    
  })
})
