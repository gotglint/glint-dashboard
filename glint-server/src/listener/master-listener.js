import Amqp from '../amqp/amqp';
import Promise from 'bluebird';

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

    return this.amqp.init().then(() => {
      log.debug('Master listener connected to AMQP, declaring queue.');
      this.amqp.declareQueue('worker', {durable: true}).then(() => {
        log.debug('Master listener declared queue, registering handler.');
        this.amqp.registerHandler('worker', (message) => {
          log.debug('Worker sent message: ', message);

          this.amqp.ackMessage(message);
        });

        return Promise.resolve(true);
      });
    }).catch((err) => {
      log.error('Master listener could not connect to AMQP: ', err);
      return Promise.reject(err);
    });
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
