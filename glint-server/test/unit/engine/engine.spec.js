import chai from 'chai';

import getLog from '../../../src/util/log';
const log = getLog();

import {GlintManager} from '../../../src/engine/manager';
import {SlaveListener} from '../../../src/net/slave-listener';

describe('Bootstrap the glint cluster', () => {
  const expect = chai.expect;

  let glintManager = new GlintManager('inproc://glint-test');
  let glintSlave = new SlaveListener('inproc://glint-test');

  before(() => {
    log.debug('Doing pre-test configuration/initialization.');

    return [glintManager.init(), glintSlave.init()];
  });

  after(() => {
    log.debug('Cleaning up after test.');

    return [glintManager.shutdown(), glintSlave.shutdown()];
  });

  it('Executes a script', () => {
    const result = glintManager.processJob({message:'do something'});

    expect(result).not.to.be.null;
  });
});
