

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