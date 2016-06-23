var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var nested = './test/files/nested/nested/nested'

describe('setup', ()=> {
  it('should make a "files" directory with a file inside', ()=> {
    fs.mkdirSync(dir)
    return assert.eventually.equal(pro.mkdirp(nested), null)
  })
})

describe('removerf', ()=> {
  describe("on a directory with files", ()=> {
    it('should delete them & return null', ()=> {
      return assert.eventually.equal(pro.removerf(dir), null)
    })
  })
  describe("on file that doesn't exist", () => {
    it("should throw ENOENT", ()=> {
      return assert.eventually.equal(pro.removerf(dir).catch(e=>e.code), 'ENOENT')
    })
  })
})

describe('cleanup', ()=> {
})
