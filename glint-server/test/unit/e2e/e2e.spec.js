const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const GlintClient = require('glint-lib');

const log = require('../../../src/util/log').getLogger('engine.spec');

const GlintManager = require('../../../src/engine/manager');
const SlaveListener = require('../../../src/listener/slave-listener');

describe('e2e test', function() {
  chai.use(chaiAsPromised);
  chai.should();
  const expect = chai.expect;

  const glintManager = new GlintManager('localhost', 45468);
  const glintSlave1 = new SlaveListener('localhost', 45468, 125000);
  const glintSlave2 = new SlaveListener('localhost', 45468, 125000);

  const glintClient = new GlintClient('localhost', 45468);

  const pause = new Promise((resolve) => {
    setTimeout(() => {log.info('Waiting...'); resolve();}, 2500);
  });

  before(function() {
    this.timeout(30000);

    log.info('Doing pre-test configuration/initialization.');

    return Promise.all([glintManager.init(), glintSlave1.init(), glintSlave2.init(), pause, glintClient.init(), pause]);
  });

  after(function() {
    log.info('Cleaning up after test.');

    return [glintManager.shutdown(), glintSlave1.shutdown(), glintSlave2.shutdown()];
  });

  it('runs a simple map operation via the client', function(done) {
    this.timeout(60000);

    log.info('Beginning test.');

    const input = [...new Array(5).keys()].slice(1);

    const gc = new GlintClient();
    gc.parallelize(input).map((el) => {
      return el + 324;
    }).filter((el, idx) => {
      return !!(el === 325 || idx === 2);
    });
    gc.run();

    log.info('Job data composed, submitting for processing.');

    const jobId = glintManager.processJob(data);
    expect(jobId).to.not.be.null;
    log.info(`Job ID: ${jobId}`);

    return glintManager.waitForJob(jobId).then((results) => {
      log.info('Job passed.');
      log.debug('Job results: ', results);
      expect(results).to.have.lengthOf(2);
      expect(results).to.eql([325, 327]);
      done();
    });
  });
});
