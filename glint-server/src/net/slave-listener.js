import util from 'util';

import Promise from 'bluebird';
import Primus from 'primus';

import getLog from '../util/log';
const log = getLog();

export class SlaveListener {
  constructor(host, port) {
    log.debug('Slave listener constructor firing.');

    this.host = host;
    this.port = port;

    this.connected = false;
  }

  /**
   * Initialize the slave connection to the master.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    return new Promise((resolve) => {
      log.debug('Connecting slave to master: %s:%d', this.host, this.port);

      const Socket = Primus.createSocket({ transformer: 'websockets', parser: 'json' });
      this.client = new Socket(util.format('http://%s:%d', this.host, this.port));

      this.client.on('open', ()  =>{
        this.connected = true;
        resolve();
      });
    });
  }

  sendMessage(message) {
    if (this.connected === false) {
      log.warn('Master listener not connected; cannot send message.');
      return Promise.reject('Slave listener not connected; cannot send message.');
    }

    return new Promise((resolve/*, reject*/) => {
      log.debug('Sending message: ', message);
      this.client.write(message);
      resolve();
    });
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('Master listener not connected; bypassing shutdown request.');
      return Promise.reject('Slave listener not connected; bypassing shutdown request.');
    }

    log.debug('Shutting down slave listener.');
    return new Promise((resolve) => {
      this.client.destroy();

      log.debug('Connection closed.');
      resolve();
    });
  }
}
