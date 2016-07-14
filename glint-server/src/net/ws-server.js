const log = require('../util/log');

const Promise = require('bluebird');
const Primus = require('primus');

class WebSocketServer {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.primus = null;
    this.connected = false;

    this.clients = new WeakMap();
    this.handlers = [];
  }

  init() {
    log.debug(`WS server is initializing, binding to: ${this.host}:${this.port}`);

    return new Promise((resolve) => {
      this.primus = Primus.createServer({
        hostname:           this.host,
        port:               this.port,
        transformer:        'websockets',
        iknowhttpsisbetter: true
      });

      this.primus.on('connection', (spark) => {
        log.debug('WS server client connected: ', spark);

        spark.on('data', (data) => {
          log.debug('Client sent a data: ', data);
        });
      });

      this.primus.on('disconnection', (deets) => {
        log.debug('Client disconnected: ', deets);
      });

      this.primus.on('error', function (err) {
        log.debug('WS server error: ', err);
      });

      this.connected = true;
      resolve();
    });
  }

  /**
   * Register a function to handle messages for a given type
   *
   * @param command The command to listen for
   * @param fn The function to fire for messages for the specified command
   *
   */
  registerHandler(command, fn) {
    this.handlers.push(command, fn);
  }

  /**
   * Send a message to a specified client
   *
   * @param client The client to send a message to
   * @param message The message to send to the client
   */
  sendMessage(client, message) {
    if (this.connected === true) {
      const ws = this.clients.get(client);
      if (ws === undefined) {
        log.error('No client with ID %s found.', client);
        throw new Error(`No client with ID ${client} found`);
      }

      ws.send(message);
    } else {
      throw new Error('WS server not online, cannot send message.');
    }
  }

  shutdown() {
    if (this.connected === false) {
      log.warn('WS server not online; bypassing shutdown request.');
      return Promise.resolve('WS server not online; bypassing shutdown request.');
    }

    log.debug('Shutting down WS server.');
    return new Promise((resolve) => {
      this.primus.destroy({ timeout: 500 }, () => {
        log.debug('WS server destroyed.');
        this.connected = false;
        this.handlers = [];

        resolve();
      });
    });
  }
}

module.exports = WebSocketServer;
