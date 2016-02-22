import Promise from 'bluebird';

import getLog from '../util/log';
const log = getLog();

import Primus from 'primus';

export class MasterListener {
  constructor(host, port) {
    log.debug('Master listener constructor firing.');

    this.host = host;
    this.port = port;

    this.connected = false;

    this.connections = 0;
  }

  init() {
    return new Promise((resolve) => {
      log.debug('Creating Primus listener: %s:%d', this.host, this.port);
      this.primus = Primus.createServer({hostname: this.host, port: this.port, transformer: 'websockets'});

      this.primus.on('initialised', () => {
        log.debug('Master listener is alive.');
        this.connected = true;
        resolve();
      });

      this.primus.on('connection', (spark) => {
        log.debug('Slave connected: ', spark);
        this.connections++;
        spark.write('Pong.');
      });

      this.primus.on('disconnection', (spark) => {
        log.debug('Slave disconnected: ', spark);
        this.connections--;
      });
    });
  }

  getConnections() {
    return this.connections;
  }

  distributeMessage(message) {
    if (this.connected === false) {
      log.warn('Not connected to the broker, cannot send message.');
      return Promise.reject(new Error('Not connected to the broker.'));
    }

    return new Promise((resolve/*, reject*/) => {
      log.debug('Sending message: %j', message);

      log.debug('Message sent.');
      resolve();
    });
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('Master listener not connected; shutdown request being bypassed.');
      return Promise.resolve();
    }

    log.debug('Shutting down master listener.');
    return new Promise((resolve/*, reject*/) => {
      this.primus.destroy({timeout: 5000});

      log.debug('Listener closed.');
      resolve();
    });
  }
}
