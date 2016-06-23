var assert = require('chai').use(require('chai-as-promised')).assert
var pro = require('..')
var fs = require('fs')

var dir = './test/files'
var dirs = ['./test/files/folder1/' , './test/files/folder1/folder2']

describe('setup', ()=> {
  it('should make a "files" directory', ()=> {
    fs.mkdirSync(dir)
  })
  it('should make the path folder1/folder2', ()=> {
    fs.mkdirSync(dirs[0])
    fs.mkdirSync(dirs[1])
  })
})


describe('rmdir', ()=> {

  describe('on a non empty directory', ()=> {
    it('should throw ENOTEMPTY', ()=> {
      return assert.eventually.equal(pro.rmdir(dirs[0]).catch(e=>e.code), 'ENOTEMPTY')
    })
  })

  describe('on empty directories', ()=> {
    it('should remove directories and return null', ()=> {
      var promise = pro.rmdir(dirs.pop()).then(e=>pro.rmdir(dirs.pop()))
      return assert.eventually.equal(promise, null)
    })
  })

})

describe('cleanup', ()=> {
  it('removes the "files" directory', ()=> {
 	 	//fs.rmdirSync(dirs[1])
 		//fs.rmdirSync(dirs[0])
	  fs.rmdirSync(dir)
  })
})
