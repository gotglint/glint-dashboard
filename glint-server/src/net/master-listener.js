import zmq from 'zmq';
import Promise from 'bluebird';

import getLog from '../util/log';
const log = getLog();

export class MasterListener {
  constructor(host) {
    log.debug('Master listener constructor firing.');

    this.host = host;
    this.connected = false;

    this.connections = 0;

    log.debug('Creating master ZMQ socket.');
    this.broker = zmq.socket('req');

    this.enableDebug();
  }

  init() {
    return new Promise((resolve, reject) => {
      log.debug('Binding master listener to %s', this.host);
      this.broker.bind(this.host, (err) => {
        if (err) {
          log.error('Could not bind master listener: ', err);
          return reject(err);
        }

        log.debug('Master is bound to the broker, creating a listener.');
        this.connected = true;

        this.broker.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            log.debug('Master handling message: %j', data);
          } catch (handlerErr) {
            log.warn('Could not process message: ', handlerErr);
          }
        });

        log.debug('Listener attached.');

        resolve();
      });
    });
  }

  enableDebug() {
    log.debug('Enabling debug mode in the master listener.');
    this.broker.on('connect', (fd, ep) => {
      console.log('Connection!');
      log.debug('connect, endpoint:', ep);
      this.connections++;
    });
    this.broker.on('connect_delay', function (fd, ep) {
      log.debug('connect_delay, endpoint:', ep);
    });
    this.broker.on('connect_retry', function (fd, ep) {
      log.debug('connect_retry, endpoint:', ep);
    });
    this.broker.on('listen', function (fd, ep) {
      log.debug('listen, endpoint:', ep);
    });
    this.broker.on('bind_error', function (fd, ep) {
      log.debug('bind_error, endpoint:', ep);
    });
    this.broker.on('accept', function (fd, ep) {
      log.debug('accept, endpoint:', ep);
    });
    this.broker.on('accept_error', function (fd, ep) {
      log.debug('accept_error, endpoint:', ep);
    });
    this.broker.on('close', function (fd, ep) {
      log.debug('close, endpoint:', ep);
    });
    this.broker.on('close_error', function (fd, ep) {
      log.debug('close_error, endpoint:', ep);
    });
    this.broker.on('disconnect', (fd, ep) => {
      log.debug('disconnect, endpoint:', ep);
      this.connections--;
    });

    this.broker.on('monitor_error', function (err) {
      log.error('Error in master monitoring: %s', err);
    });

    log.debug('Turning on master ZMQ monitoring.');
    this.broker.monitor(10, 0);

    log.debug('Master listener debug mode enabled.');
  }

  getConnections() {
    return this.connections;
  }

  distributeMessage(message) {
    if (this.connected === false) {
      log.warn('Not connected to the broker, cannot send message.');
      return Promise.reject(new Error('Not connected to the broker.'));
    }

    return new Promise((resolve, reject) => {
      log.debug('Sending message: %j', message);
      this.broker.send(JSON.stringify(message), null, (err) => {
        if (err) {
          log.error('Could not send message: ', err);
          return reject(err);
        }

        log.debug('Message sent.');
        resolve();
      });
    });
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('Master listener not connected; shutdown request being bypassed.');
      return Promise.resolve();
    }

    log.debug('Shutting down master listener.');
    return new Promise((resolve, reject) => {
      log.debug('Turning off monitoring.');
      this.broker.unmonitor();

      log.debug('Unbinding broker: ', this.host);
      this.broker.unbind(this.host, (err) => {
        if (err) {
          log.error('Could not unbind from host: ', err);
          return reject(err);
        }

        log.debug('Broker unbound, closing connection.');
        this.broker.close();

        log.debug('Connection closed.');
        resolve();
      });
    });
  }
}
