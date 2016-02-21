import zmq from 'zmq';
import uuid from 'node-uuid';
import Promise from 'bluebird';

import getLog from '../util/log';
const log = getLog();

export class SlaveListener {
  constructor(host) {
    log.debug('Slave listener constructor firing.');
    this.host = host;
    this.connected = false;

    log.debug('Creating slave ZMQ socket.');
    this.dealer = zmq.socket('rep');
    this.dealer.setsockopt(zmq.ZMQ_RECONNECT_IVL, 100);
    this.dealer.setsockopt(zmq.ZMQ_RECONNECT_IVL_MAX, 30000);
    this.dealer.identity = uuid.v4();

    log.debug('Slave ZMQ socket created, assigned ID: ', this.dealer.identity);
  }

  /**
   * Initialize the slave connection to the master.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    return new Promise(() => {
      log.debug('Binding slave %s requester to %s', this.dealer.identity, this.host);
      this.dealer.connect(this.host);

      //  Get workload from broker, until finished
      this.dealer.on('message', (data) => {
        log.debug('Slave handling message: ', data);

        this.dealer.send(JSON.stringify({reply: 'done'}));
      });

      this.connected = true;
      return this.sendMessage(JSON.stringify({start: 'yes'}));
    });
  }

  enableDebug() {
    log.debug('Enabling debug mode in the slave listener.');
    this.dealer.on('connect', function (fd, ep) {
      log.debug('connect, endpoint:', ep);
    });
    this.dealer.on('connect_delay', function (fd, ep) {
      log.debug('connect_delay, endpoint:', ep);
    });
    this.dealer.on('connect_retry', function (fd, ep) {
      log.debug('connect_retry, endpoint:', ep);
    });
    this.dealer.on('listen', function (fd, ep) {
      log.debug('listen, endpoint:', ep);
    });
    this.dealer.on('bind_error', function (fd, ep) {
      log.debug('bind_error, endpoint:', ep);
    });
    this.dealer.on('accept', function (fd, ep) {
      log.debug('accept, endpoint:', ep);
    });
    this.dealer.on('accept_error', function (fd, ep) {
      log.debug('accept_error, endpoint:', ep);
    });
    this.dealer.on('close', function (fd, ep) {
      log.debug('close, endpoint:', ep);
    });
    this.dealer.on('close_error', function (fd, ep) {
      log.debug('close_error, endpoint:', ep);
    });
    this.dealer.on('disconnect', function (fd, ep) {
      log.debug('disconnect, endpoint:', ep);
    });

    this.dealer.on('monitor_error', function (err) {
      log.error('Error in slave monitoring: %s', err);
    });

    log.debug('Turning on slave ZMQ monitoring.');
    this.dealer.monitor(10, 0);

    log.debug('Slave listener debug mode enabled.');
  }

  sendMessage(message) {
    if (this.connected === false) {
      log.warn('Master listener not connected; cannot send message.');
      return Promise.reject('Slave listener not connected; cannot send message.');
    }

    return new Promise((resolve, reject) => {
      log.debug('Sending message: ', message);
      this.dealer.send(JSON.stringify(message), null, (err) => {
        if (err) {
          log.warn('Could not send message: ', err);
          return reject(err);
        }

        log.debug('Message sent.');
        resolve();
      });
    });
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('Master listener not connected; bypassing shutdown request.');
      return Promise.reject('Slave listener not connected; bypassing shutdown request.');
    }

    log.debug('Shutting down slave listener.');
    return new Promise((resolve) => {
      log.debug('Turning off monitoring.');
      this.dealer.unmonitor();

      log.debug('Disconnecting dealer.');
      this.dealer.disconnect(this.host);

      log.debug('Dealer disconnected, closing connection.');
      this.dealer.close();

      log.debug('Connection closed.');
      resolve();
    });
  }
}
