
const files = global.data.touch
const file = files[0]
const text = "test-text-000"

describe(`touch "${file}"`, () => {
  it(`should create a file if it doesn't exist`, () => {
    return profs.touch(file).should.be.fulfilled
  })

  after(`check to see if file exists`, () => {
    return profs.accessAsync(file).should.be.fulfilled
  })
})

describe(`touch "${file}"`, () => {
  before(`create a file with text`, () => {
    return profs.writeFileAsync(file, text, 'utf8').should.be.fulfilled
  })

  it(`should not truncate the file by default`, () => {
    return profs.touch(file).should.be.fulfilled
  })

  after('read the file and see if text is still there', () => {
    return profs.readFileAsync(file, 'utf8').then(file_text => {
      assert(file_text === text, `expect ${text} to equal ${file_text}`)
    }).should.be.fulfilled
  })
})

describe(`touch("${file}", true)`, () => {

  before(()=> {
    profs.writeFileSync(file, text, 'utf8')
  })

  it(`should truncate the file`, () => {
    return profs.touch(file, true).then(() => {
      assert(profs.readFileSync(file, 'utf8') === '', `File "${file}" should contain the text ""`)
    }).should.be.fulfilled
  })
})

describe(`touch "./"`, () => {
  it(`should fail because the CWD is an existing directory`, () => {
    return profs.touch('./').catch(e => {
      assert(e.code === 'EISDIR')
      throw e
    }).should.be.rejected
  })
})