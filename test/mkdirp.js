
describe(`mkdirp "${'test/data/does/not/exist/yet'}"`, () => {
  it(`should create all directories in a path`, () => {
    return profs.mkdirp(global.data.mkdirp).should.be.fulfilled
  })
  it(`should succeed quicker when directories exist`, () => {
    return profs.mkdirp(global.data.mkdirp).should.be.fulfilled
  })
})