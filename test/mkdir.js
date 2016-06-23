var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var nested_dir = './test/files/inter/nested'
var intermediate_dir = './test/files/inter'


describe('setup mkdir', ()=> {
  it('should make a "files" directory', () => {
    fs.mkdirSync(dir)
  })
})

describe('mkdir', ()=> {

  // ensure same behavior
  describe('on a directory that exists', ()=> {
    it('should throw EEXIST', ()=> {
      return assert.eventually.equal(pro.mkdir(dir).catch(e=>e.code), 'EEXIST')
    })
  })

  // make sure we don't add magic features
  describe("on a path that doesn't yet exist", ()=> {
    it("should throw ENOENT", ()=> {
      return assert.eventually.equal(pro.mkdir(nested_dir).catch(e=>e.code), 'ENOENT')
    })
  })

  describe("on a valid path", ()=> {
    it("should create the file and resolve it's path", ()=> {
      var promise = pro.mkdir(intermediate_dir).then(path => pro.mkdir(nested_dir))
      return assert.eventually.equal(promise, nested_dir)
    })
  })
})

describe('cleanup', ()=> {
  it('should remove "files" folder', ()=> {
    fs.rmdirSync(nested_dir)
    fs.rmdirSync(intermediate_dir)
    fs.rmdirSync(dir)
  })
})
