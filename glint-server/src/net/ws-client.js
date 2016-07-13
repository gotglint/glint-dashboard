const log = require('../util/log').getLog();

const Promise = require('bluebird');
const Primus = require('primus');

class WebSocketClient {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.ws = null;
    this.connected = false;
  }

  init() {
    log.debug(`WS client is initializing, connecting to: ${this.host}:${this.port}`);

    return new Promise((resolve) => {
      const wsServer = `http://${this.host}:${this.port}`;
      log.debug(`Connecting to ${wsServer}`);

      const Socket = Primus.createSocket({transformer: 'websockets'});
      this.ws = new Socket(wsServer);

      this.ws.on('open', () => {
        log.debug('WS client is connected.');

        this.connected = true;
        resolve('Connection opened.');
      });

      this.ws.on('message', (message) => {
        log.debug(`WS client received a message: ${message}`);
      });

      this.ws.on('error', (err) => {
        log.error(`WS client threw an error: ${err}`);
      });

      this.ws.on('close', () => {
        log.debug('WS client closed connection.');
      });
    });
  }

  /**
   * Send a message to a specified client
   *
   * @param message The message to send to the client
   */
  sendMessage(message) {
    if (this.connected === true) {
      this.ws.write(message);
    } else {
      throw new Error('WS server not online, cannot send message.');
    }
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('WS client not online; bypassing shutdown request.');
      return Promise.resolve('WS client not online; bypassing shutdown request.');
    }

    log.debug('Shutting down WS client.');
    return new Promise((resolve) => {
      this.ws.destroy({ timeout: 500 }, () => {
        log.debug('WS client destroyed.');
        this.connected = false;
        resolve();
      });
    });
  }
}

module.exports = WebSocketClient;
