var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var file1 = dir+'/f1.txt'

describe('setup', ()=> {
  it('should make a "files" directory', ()=> {
    fs.mkdirSync(dir)
  })
})

describe('rmdir', ()=> {

  describe("on a file that doesn't exist", ()=> {
    it('should create it with w argument and return a fd as Integer', ()=> {
			var promise = pro.open(file1, 'w').then(Number.isInteger)
			
      return assert.eventually.equal(promise, true)
    })
  })

})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
	  fs.unlinkSync(file1)
		fs.rmdirSync(dir)
  })
})
