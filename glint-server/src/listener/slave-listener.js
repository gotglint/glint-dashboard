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

    return this.amqp.init().then(() => {
      log.debug('Slave listener connected to AMQP, declaring queue.');
      this.amqp.declareQueue('worker', {durable: true}).then(() => {
        log.debug('Slave listener declared queue, sending registration message.');

        return this.sendMessage('worker', 'worker online');
      });
    }).catch((err) => {
      log.error('Slave listener could not connect to AMQP: ', err);
      return Promise.reject(err);
    });
  }

  sendMessage(queue, message) {
    log.debug('Slave listener sending message.');
    return this.amqp.sendMessage(queue, message);
  }

  shutdown() {
    log.debug('Slave listener shutting down.');
    return this.amqp.shutdown();
  }
}
