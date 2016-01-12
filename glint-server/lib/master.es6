import getLog from './util/log.es6';
const log = getLog();

import os from 'os';

import { Etcd } from './util/etcd.es6';
import { MasterListener } from './net/master-listener.es6';

// hack for us to be able to pull in options
module.exports = function (options) {
  log.debug('Kicking off the master - connecting to [ %s:%s ], forceMaster: %s', options.host, options.port, options.forceMaster);

  async function init() {
    const etcd = new Etcd(options.host, options.port);

    if (options.forceMaster !== true) {
      // check to see if an existing master is there
      log.debug('Checking to see if there is an existing master...');

      try {
        let existingMaster = await etcd.get('master');
        log.debug('Discovered existing master: ', existingMaster);

        if (existingMaster) {
          log.warn('There is already a master node; dying.  You can use -f to force this node to become the master, but be very careful.');
          process.exit(1);
        }
      } catch (exception) {
        // yeah, an exception means that the key doesn't exist
        if (exception && exception.cause && exception.cause.errorCode && exception.cause.errorCode === 100) {
          log.debug('There is no current master, allowing init to continue.');
        } else {
          log.warn('We could not check the master status from etcd; terminating. Exception: ', exception);
          process.exit(1);
        }
      }

      // fire up the listener
      log.debug('Firing up listener.');
      const listener = new MasterListener('0.0.0.0', 3000);
      listener.init();
    }

    let masterName = os.hostname();
    log.debug('Setting new master to the current host, %s', masterName);

    await etcd.set('master', masterName, 10);

    log.debug('Double checking that the master was set properly.');

    let master = await etcd.get('master');
    log.debug('Double check master: %s', master);

    if (master !== masterName) {
      log.warn('Seems that we couldn\'t set the master name properly, dying.');
      process.exit(1);
    }

    setInterval(function() {
      // keep alive
      etcd.set('master', masterName, 10);
    }, 7500);
  }

  init();
};
