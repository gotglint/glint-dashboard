import Amqp from '../amqp/amqp';

import getLog from '../util/log';
const log = getLog();

export default class MasterListener {
  constructor() {
    log.debug('Master listener constructor firing.');

    this.amqp = null;
  }

  /**
   * Initialize the Master connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Master listener connecting to AMQP.');
    this.amqp = new Amqp();
    return this.amqp.init();
  }

  sendMessage(message) {
    log.debug('Master listener sending message.');
    return this.amqp.sendMessage('glint', message);
  }

  shutdown() {
    log.debug('Master listener shutting down.');
    return this.amqp.shutdown();
  }
}
