
const file = global.data.removerf

describe(`removerf ${file}`, () => {
  it(`should delete all files and directories including ${file}`, () => {
    return profs.removerf(file).should.be.fulfilled
  })

  after(`check to see if ${file} is deleted`, () => {
    return profs.readdirAsync(file).should.be.rejected // with an ENOENT
  })
})