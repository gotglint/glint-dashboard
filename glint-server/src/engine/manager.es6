import getLog from '../util/log';
const log = getLog();

import os from 'os';

import { Etcd } from '../util/etcd.es6';
import { MasterListener } from '../net/master-listener.es6';

export class GlintManager {
  constructor(etcdHost, etcdPort, masterHost, masterPort, forceMaster) {
    log.debug('Master initializing.');

    log.debug('Master using %s:%s for etcd.', etcdHost, etcdPort);
    this.etcd = new Etcd(etcdHost, etcdPort);

    log.debug('Master listener binding to %s:%s', masterHost, masterPort);
    this.masterListener = new MasterListener(masterHost, masterPort);

    this.forceMaster = forceMaster;
  }

  async init() {
    if (this.forceMaster !== true) {
      // check to see if an existing master is there
      log.debug('Checking to see if there is an existing master...');

      try {
        let existingMaster = await this.etcd.get('master');
        log.debug('Discovered existing master: ', existingMaster);

        if (existingMaster) {
          log.warn('There is already a master node; dying.  You can use -f to force this node to become the master, but be very careful.');
          //noinspection ExceptionCaughtLocallyJS
          throw new Error('There is already a master node; dying.  You can use -f to force this node to become the master, but be very careful.');
        }
      } catch (err) {
        // yeah, an err means that the key doesn't exist
        if (err && err.cause && err.cause.errorCode && err.cause.errorCode === 100) {
          log.debug('There is no current master, allowing init to continue.');
        } else {
          log.warn('We could not check the master status from etcd; terminating. Error: ', err);
          throw new Error('Could not retrieve master status from etcd.');
        }
      }
    }

    const masterName = os.hostname();
    log.debug('Setting new master to the current host, %s', masterName);

    await this.etcd.set('master', masterName, 10);

    log.debug('Double checking that the master was set properly.');

    const master = await this.etcd.get('master');
    log.debug('Double check master from etcd: %s', master);

    if (master !== masterName) {
      log.warn('Seems that we couldn\'t set the master name properly, dying.');
      throw new Error('Could not set master name in etcd, dying.');
    }

    try {
      log.debug('Master listener created, enabling debug mode.');
      this.masterListener.enableDebug();

      log.debug('Master listener debug mode enabled, initializing.');
      await this.masterListener.init();

      log.debug('Master listener online, starting heartbeat.');
      setInterval(() => {
        // keep alive
        this.etcd.set('master', masterName, 10);
      }, 7500);
    } catch (error) {
      log.error('Could not initialize master listener: ', error);
      throw new Error('Could not initialize master listener.');
    }
  }

  shutdown() {
    log.debug('Glint manager shutting down.');
  }
}
