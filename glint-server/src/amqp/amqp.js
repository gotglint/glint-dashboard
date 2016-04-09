import amqp from 'amqplib';
import Promise from 'bluebird';

import getLog from '../util/log';
const log = getLog();

export default class Amqp {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connected = false;
  }

  init() {
    log.debug('AMQP is initializing.');
    return new Promise((resolve, reject) => {
      const open = amqp.connect('amqp://localhost:5682');
      open.then((connection) => {
        log.debug('AMQP connected to queue, now creating channel.');

        this.connection = connection;
        this.connected = true;

        process.once('SIGINT', this.connection.close.bind(this.connection));

        this.connection.createChannel().then((channel) => {
          log.debug('AMQP channel created, all initialized.');
          this.channel = channel;

          resolve();
        }, (err) => {
          log.error('Slave listener could not create channel: ', err);
          reject(err);
        });
      }, (err) => {
        log.error('Slave listener could not connect to RabbitMQ: ', err);
        reject(err);
      });
    });
  }

  /**
   * Register a function to handle messages from a queue
   *
   * @param queue The queue to listen on
   * @param fn The function to fire for messages from the specified queue
   *
   */
  registerHandler(queue, fn) {
    this.channel.consume(queue, fn);
  }

  /**
   * Send a message to a specified queue
   *
   * @param queue The queue to send a message to
   * @param message The message to publish to the queue
   */
  sendMessage(queue, message) {
    this.channel.sendToQueue(queue, new Buffer(message));
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('AMQP not connected; bypassing shutdown request.');
      return Promise.resolve('AMQP not connected; bypassing shutdown request.');
    }

    log.debug('Shutting down AMQP.');
    return new Promise((resolve) => {
      Promise.all([this.channel.close(), this.connection.close()])
        .then(() => {
          this.connected = false;
          log.info('RabbitMQ channel and connection closed.');
          resolve();
        })
        .catch((err) => {
          this.connected = false;
          log.warn('There was an error closing the channel or connection: ', err);
          resolve();
        });
    });
  }
}
