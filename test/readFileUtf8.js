var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var file1 = './test/files/text.file'
var text1 = 'this is my text file'

describe('setup mkdir', ()=> {
  it('should make a "files" directory', () => {
    fs.mkdirSync(dir)
    fs.writeFileSync(file1, text1)
  })
})

describe('readFileUtf8', ()=> {

  describe('on a directory', ()=> {
    it('should throw EISDIR', ()=> {
      return assert.eventually.equal(pro.readFileUtf8(dir).catch(e=>e.code), 'EISDIR')
    })
  })

  describe("on an existing readable file", ()=> {
    it("should return the contents in a string", ()=> {
      return assert.eventually.equal(pro.readFileUtf8(file1), text1)
    })
  })
})

describe('cleanup', ()=> {
  it('should remove "files" folder', ()=> {
    fs.unlinkSync(file1)
    fs.rmdirSync(dir)
  })
})
