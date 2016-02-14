import getLog from './util/log';
const log = getLog();

log.debug('Kicking off a slave.');

import { SlaveListener } from './net/slave-listener';

// hack for us to be able to pull in options
module.exports = function (options) {
  async function init() {
    try {
      log.debug('Slave coming online - kicking off the listener on %s:%s', options.masterHost, options.masterPort);
      const slaveListener = new SlaveListener(options.masterHost, options.masterPort);

      log.debug('Slave listener created, enabling debug mode.');
      slaveListener.enableDebug();

      log.debug('Slave listener debug mode enabled, initializing.');
      await slaveListener.init();

      log.debug('Slave listener online, starting heartbeat.');
    } catch (error) {
      log.error('Could not initialize slave listener: ', error);
      process.exit(1);
    }
  }

  init();
};
