import getLog from './util/log.es6';
const log = getLog();

log.debug('Kicking off a slave.');

import { SlaveListener } from './net/slave-listener.es6';

// hack for us to be able to pull in options
module.exports = function (options) {
  async function init() {
    log.debug('Slave coming online - kicking off the listener on %s:%s', options.masterHost, options.masterPort);
    const slaveListener = new SlaveListener(options.masterHost, options.masterPort);
    slaveListener.init();
  }

  init();
};
