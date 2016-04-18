import WebSocketServer from '../net/ws-server';

import getLog from '../util/log';
const log = getLog();

export default class MasterListener {
  constructor(host, port) {
    log.debug('Master listener constructor firing, using %s:%s as the host/port to bind to.', host, port);

    this.host = host;
    this.port = port;

    this.wss = null;
  }

  /**
   * Initialize the Master connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Master listener instantiating WS server.');
    this.wss = new WebSocketServer(this.host, this.port);

    return this.wss.init();
  }

  sendMessage(message) {
    log.debug('Master listener sending message.');
    return this.wss.sendMessage('glint', message);
  }

  shutdown() {
    log.debug('Master listener shutting down.');
    return this.wss.shutdown();
  }
}
