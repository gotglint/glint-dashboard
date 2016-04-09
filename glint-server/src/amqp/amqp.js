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

    return amqp.connect('amqp://localhost:5682').then((connection) => {
      log.debug('AMQP connected to server, now creating channel.');

      this.connection = connection;
      this.connected = true;

      process.once('SIGINT', this.connection.close.bind(this.connection));

      return this.connection.createChannel().then((channel) => {
        log.debug('AMQP channel created, all initialized.');
        this.channel = channel;

        return Promise.resolve(true);
      });
    });
  }

  declareQueue(queue, options) {
    return new Promise((resolve, reject) => {
      if (this.connected === true) {
        log.debug('AMQP declaring queue: ', queue);
        this.channel.assertQueue(queue, options).then((ok) => {
          log.debug('AMQP declared queue: ', ok);
          resolve(ok);
        });
      } else {
        log.error('AMQP not connected, cannot declare queue.');
        reject(new Error('Not connected to RabbitMQ, cannot declare queue.'));
      }
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
    if (this.connected === true) {
      this.channel.consume(queue, fn);
    } else {
      throw new Error('Not connected to RabbitMQ, cannot declare queue.');
    }
  }

  /**
   * Send a message to a specified queue
   *
   * @param queue The queue to send a message to
   * @param message The message to publish to the queue
   */
  sendMessage(queue, message) {
    if (this.connected === true) {
      this.channel.sendToQueue(queue, new Buffer(message));
    } else {
      throw new Error('Not connected to RabbitMQ, cannot declare queue.');
    }
  }

  /**
   * Acknowledge the message
   *
   * @param message
   */
  ackMessage(message) {
    this.channel.ack(message);
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
