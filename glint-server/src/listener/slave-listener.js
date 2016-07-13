const WebSocketClient = require('../net/ws-client');
const log = require('../util/log').getLog();

class SlaveListener {
  constructor(host, port, maxMem) {
    log.debug(`Slave listener constructor firing, connecting to ${host}:${port} - using ${maxMem}m as the memory limit`);

    this.host = host;
    this.port = port;
    this.maxMem = maxMem;

    this.ws = null;
  }

  /**
   * Initialize the slave connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Slave listener connecting to WS server.');
    this.ws = new WebSocketClient(this.host, this.port);

    return this.ws.init().then(() => {
      log.debug('Slave listener created WS client.');
      return this.sendMessage('worker', 'worker online');
    }).catch((err) => {
      log.error(`Slave listener could not connect to WS server: ${err}`);
      return Promise.reject(err);
    });
  }

  sendMessage(type, message) {
    log.debug('Slave listener sending message.');
    return this.ws.sendMessage({type: type, message: message});
  }

  shutdown() {
    log.debug('Slave listener shutting down.');
    return this.ws.shutdown();
  }
}

module.exports = SlaveListener;
