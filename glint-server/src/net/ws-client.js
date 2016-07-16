const log = require('../util/log');

const Promise = require('bluebird');
const bson = require('bson');
const Primus = require('primus');

const _host = Symbol('host');
const _port = Symbol('port');

const _bson = Symbol('bson');

const _ws = Symbol('ws');
const _connected = Symbol('connected');

const _slave = Symbol('slave');

class WebSocketClient {
  constructor(host, port) {
    this[_host] = host;
    this[_port] = port;

    this[_ws] = null;
    this[_connected] = false;

    this[_slave] = null;

    this[_bson] = new bson.BSONPure.BSON();
  }

  init() {
    log.debug(`WS client is initializing, connecting to: ${this[_host]}:${this[_port]}`);

    return new Promise((resolve) => {
      const wsServer = `http://${this[_host]}:${this[_port]}`;
      log.debug(`Connecting to ${wsServer}`);

      const Socket = Primus.createSocket({transformer: 'websockets', parser: 'binary'});
      this[_ws] = new Socket(wsServer);

      this[_ws].on('open', () => {
        log.debug('WS client is connected.');

        this[_connected] = true;
        resolve('Connection opened.');
      });

      this[_ws].on('data', (data) => {
        log.debug(`WS client received a message: ${data}`);

        if (this[_slave]) {
          this[_slave].handleMessage(data);
        }
      });

      this[_ws].on('error', (err) => {
        log.error(`WS client threw an error: ${err}`);
      });

      this[_ws].on('close', () => {
        log.debug('WS client closed connection.');
      });
    });
  }

  registerSlave(slave) {
    this[_slave] = slave;
  }

  /**
   * Send a message to a specified client
   *
   * @param message The message to send to the client
   */
  sendMessage(message) {
    if (this[_connected] === true) {
      const serializedMessage = this[_bson].serialize(message, true, false, true);
      this[_ws].write(serializedMessage);
    } else {
      throw new Error('WS server not online, cannot send message.');
    }
  }

  shutdown() {
    if (this[_connected] === false) {
      log.warn('WS client not online; bypassing shutdown request.');
      return Promise.resolve('WS client not online; bypassing shutdown request.');
    }

    log.debug('Shutting down WS client.');
    return new Promise((resolve) => {
      this[_ws].destroy({ timeout: 500 }, () => {
        log.debug('WS client destroyed.');
        this[_connected] = false;
        resolve();
      });
    });
  }
}

module.exports = WebSocketClient;
