

describe(`walk "${global.data.walk}"`, () => {
  it(`should create a "file tree" without options`, () => {
    return profs.walk(global.data.walk).then(tree => {
      assert(tree.children.length > 0, 'root has no child directories')
    }).should.be.fulfilled
  })

})

describe(`walk "${global.data.walk}" { filter: file => !file.basename.startsWith('e') }`, () => {
  it(`should filter out any basename starting with 'e'`, () => {
    return profs.walk(global.data.walk, { filter: file => file.path.startsWith('d') }).then(tree => {
      tree.flatten().map(file => file.basename).forEach(name => {
        assert(!name.startsWith('e'))
      })
    }).should.be.fulfilled
  })
})

describe('walk with the onFile callback options', () => {
  it(`should be able to pick out select files`, () => {

    // get all '.js' files (alt)
    var js_files = []

    var options = {
      filter: file => file.isDirectory || file.basename.endsWith('.js'),
      onFile: (file, parent) => js_files.push(file.basename)
    }

    // Using Bluebird's "Promise.return"
    return profs.walk('..', options).return(js_files).then(files => {
      assert(js_files.every(file => file.endsWith('.js')))
    }).should.be.fulfilled
  })


})