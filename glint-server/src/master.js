import getLog from './util/log';
const log = getLog();

import {GlintManager} from './engine/manager';

// hack for us to be able to pull in options
module.exports = function (options) {
  log.debug('Kicking off the master - connecting to [ %s:%s ], forceMaster: %s', options.etcdHost, options.etcdPort, options.forceMaster);

  log.debug('Instantiating Glint manager.');
  const glintManager = new GlintManager(options.etcdHost, options.etcdPort, options.masterHost, options.masterPort, options.forceMaster);

  async function init() {
    log.debug('Initializing Glint manager.');
    glintManager.init();
  }

  process.on('SIGINT', () => {
    glintManager.shutdown();
  });

  init();
};
