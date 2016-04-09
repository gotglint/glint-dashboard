import Amqp from '../amqp/amqp';

import getLog from '../util/log';
const log = getLog();

export default class SlaveListener {
  constructor() {
    log.debug('Slave listener constructor firing.');

    this.amqp = null;
  }

  /**
   * Initialize the slave connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Slave listener connecting to AMQP.');
    this.amqp = new Amqp();
    return this.amqp.init();
  }

  sendMessage(message) {
    log.debug('Slave listener sending message.');
    return this.amqp.sendMessage('glint', message);
  }

  shutdown() {
    log.debug('Slave listener shutting down.');
    return this.amqp.shutdown();
  }
}
