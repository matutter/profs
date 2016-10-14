chai = require('chai')
chaiAsPromised = require('chai-as-promised')

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

profs = require('..')

global.data = {
  mkdirp : 'test/data/does/not/exist/yet',
  walk : 'test/'
}

require('./mkdirp.js')
require('./walk.js')