
var files = global.data.touch

describe(`touch "${files[0]}"`, () => {
  const file = files[0]
  const text = "test-text-000"

  it(`should create a file if it doesn't exist`, () => {
    return profs.touch(file).then(() => {
      return profs.accessAsync(file)
    }).should.be.fulfilled
  })

  it(`should not truncate the file by default`, () => {
    profs.writeFileSync(file, text, 'utf8')
    return profs.touch(file).then(() => {
      assert(profs.readFileSync(file, 'utf8') === text, `File "${file}" should contain the text "${text}"`)
    }).should.be.fulfilled
  })

  it(`should truncate with the truncate flag, touch(path, truncate = true)`, () => {
    profs.writeFileSync(file, text, 'utf8')
    return profs.touch(file, true).then(() => {
      assert(profs.readFileSync(file, 'utf8') === '', `File "${file}" should contain the text ""`)
    }).should.be.fulfilled
  })

})