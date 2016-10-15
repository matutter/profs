

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

  const options = {
    filter : {
      directory : d => d.basename !== 'node_modules',
      file : f => f.basename.endsWith('.js')
    }
  }

  it(`should only aggregate files ending in '.js' and directories not 'node_modules'`, () => {
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