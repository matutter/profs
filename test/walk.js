

describe(`walk "${global.data.walk}"`, () => {
  it(`should create a "file tree" without options`, () => {
    return profs.walk(global.data.walk).then(tree => {
      assert(tree.children.length > 0, 'root has no child directories')
    }).catch(e => {
      console.log(e)
      throw e
    }).should.be.fulfilled
  })

})

describe(`walk "${global.data.walk}" filters: dir != node_modules & file.endsWith(js)`, () => {
  it(`should only aggregate files ending in '.js' and directories not 'node_modules'`, () => {

    const options = {
      filter : {
        directory : d => d.basename !== 'node_modules',
        file : f => f.basename.endsWith('.js')
      }
    }

    return profs.walk(global.data.walk, options).then(tree => {
      var result = tree.flatten()
        .filter(f => f.isFile)
        .map(file => file.basename)
        .every(name => name.endsWith('.js'))

      assert(result, 'All files end with js')
    }).should.be.fulfilled
  })
})

describe('walk with the onFile callback options', () => {
  it(`should be able to pick out select files`, () => {

    // get all '.js' files (alt)
    var js_files = []

    var options = {
      filter: {
        file : file => file.basename.endsWith('.js')
      }, 
      onFile: (file, parent) => js_files.push(file.basename)
    }

    // Using Bluebird's "Promise.return"
    return profs.walk('..', options).return(js_files).then(files => {
      assert(js_files.every(file => file.endsWith('.js')))
    }).should.be.fulfilled
  })
})

describe(`walk: File.flatten( Function ) accepts an optional filter function`, () => {
  it(`should create flat array of only files`, () => {

    var options = {
      filter: {
        file : f => f.basename.endsWith('.js')
      }
    }

    return profs.walk('..', options)
      .then( root  => root.flatten(f => f.isFile))
      .then( js_files => {
        var res = js_files.every(file => file.basename.endsWith('.js'))
        assert(res, 'The flattened tree only contains files ending with .js')
      }).should.be.fulfilled
  })

  it(`should flatten the tree when the flatten option is used directly with walk`, () => {

    var options = {
      filter: {
        file : f => f.basename.endsWith('.js')
      },
      flatten: f => f.isFile
    }

    return profs.walk('..', options).then( js_files => {
        var res = js_files.every(file => file.basename.endsWith('.js'))
        assert(res, 'The flattened tree only contains files ending with .js')
      }).should.be.fulfilled
  })

})


describe('walk: options.filter may be a function, or object', () => {

  it('should use the filter for files & directories when a function is provided', () => {
    var dirs = false
    var files = false

    const options = {
      filter: file => {
        if(file.isFile) files = true
        if(file.isDirectory) dirs = true
        return true
      }
    }
    return profs.walk('..', options).then(() => {
      assert(dirs && files, 'shows one callback was used for both')
    }).should.be.fulfilled
  })

})


describe('walk: File.each(callback, true) ', () => {
  it('should iterate on the root first by default', () => {
    return profs.walk('..').then(root => {
      
      var first = true
      return root.each(file => {
        if(first) {
          assert(root === file)
          first = false
        }
      })
    }).should.be.fulfilled
  })
})


describe('walk with a directory filter that rejects all directories', () => {
  it('should throw an Error', () => {

    const options = {
      filter: {
        directory: () => false
      }
    }

    return profs.walk('..', options).should.be.rejected
  })
})