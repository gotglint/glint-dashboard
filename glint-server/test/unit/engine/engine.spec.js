import chai from 'chai';

import { GlintClient } from 'glint-lib';

import getLog from '../../../src/util/log';
const log = getLog();

import {GlintManager} from '../../../src/engine/manager';
import {SlaveListener} from '../../../src/net/slave-listener';

describe('Bootstrap the glint cluster', () => {
  const expect = chai.expect;

  let glintManager = new GlintManager('tcp://localhost:5671');
  let glintSlave = new SlaveListener('tcp://localhost:5671');

  const pause = new Promise((resolve) => {
    setTimeout(() => {log.debug('Waiting...'); resolve();}, 2500);
  });

  before(() => {
    log.debug('Doing pre-test configuration/initialization.');

    return Promise.all([glintManager.init(), glintSlave.init(), pause]);
  });

  after(() => {
    log.debug('Cleaning up after test.');

    return [glintManager.shutdown(), glintSlave.shutdown()];
  });

  it('Executes a script', () => {
    log.debug('Beginning test.');
    const gc = new GlintClient();
    const data = gc.parallelize([1, 2, 3, 4]).map((el) => {
      return el;
    }).getData();

    const result = glintManager.processJob(data);

    expect(result).not.to.be.null;
  });
});
