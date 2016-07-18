const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const GlintClient = require('glint-lib');

const log = require('../../../src/util/log');

const GlintManager = require('../../../src/engine/manager');
const SlaveListener = require('../../../src/listener/slave-listener');

describe('Bootstrap the Glint cluster', function() {
  chai.use(chaiAsPromised);
  chai.should();
  const expect = chai.expect;

  const glintManager = new GlintManager('localhost', 45468);
  const glintSlave1 = new SlaveListener('localhost', 45468, 1024);
  const glintSlave2 = new SlaveListener('localhost', 45468, 1024);

  const pause = new Promise((resolve) => {
    setTimeout(() => {log.debug('Waiting...'); resolve();}, 2500);
  });

  before(function() {
    this.timeout(30000);

    log.debug('Doing pre-test configuration/initialization.');

    return Promise.all([glintManager.init(), glintSlave1.init(), glintSlave2.init(), pause]);
  });

  after(function() {
    log.debug('Cleaning up after test.');

    return [glintManager.shutdown(), glintSlave1.shutdown(), glintSlave2.shutdown()];
  });

  it('Executes a script', function() {
    this.timeout(60000);

    log.debug('Beginning test.');
    const gc = new GlintClient();
    const data = gc.parallelize([1, 2, 3, 4]).map((el) => {
      return el;
    }).getData();

    log.debug('Job data composed, submitting for processing.');

    const jobId = glintManager.processJob(data);
    expect(jobId).to.not.be.null;
    log.debug(`Job ID: ${jobId}`);

    return glintManager.waitForJob(jobId).should.be.fulfilled;
  });
});
