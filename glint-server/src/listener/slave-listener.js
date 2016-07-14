const WebSocketClient = require('../net/ws-client');
const log = require('../util/log');

const _host = Symbol('host');
const _port = Symbol('port');
const _maxMem = Symbol('maxMem');
const _ws = Symbol('ws');

class SlaveListener {
  constructor(host, port, maxMem) {
    log.debug(`Slave listener constructor firing, connecting to ${host}:${port} - using ${maxMem}m as the memory limit`);

    this[_host] = host;
    this[_port] = port;
    this[_maxMem] = maxMem;

    this[_ws] = null;
  }

  /**
   * Initialize the slave connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Slave listener connecting to WS server.');
    this[_ws] = new WebSocketClient(this[_host], this[_port]);

    return this[_ws].init().then(() => {
      log.debug('Slave listener created WS client.');
      return this.sendMessage('online', {maxMem: this[_maxMem]});
    }).catch((err) => {
      log.error(`Slave listener could not connect to WS server: ${err}`);
      return Promise.reject(err);
    });
  }

  sendMessage(type, data) {
    log.debug('Slave listener sending message.');
    return this[_ws].sendMessage({type: type, data: data});
  }

  shutdown() {
    log.debug('Slave listener shutting down.');
    return this[_ws].shutdown();
  }
}

module.exports = SlaveListener;
