const log = require('../util/log');

const WebSocketServer = require('../net/ws-server');

const _host = Symbol('host');
const _port = Symbol('port');
const _wss = Symbol('wss');

const _clients = Symbol('clients');
const _manager = Symbol('manager');

class MasterListener {
  constructor(host, port) {
    log.debug('Master listener constructor firing, using %s:%s as the host/port to bind to.', host, port);

    this[_host] = host;
    this[_port] = port;

    this[_wss] = null;

    this[_clients] = new Map();
    this[_manager] = null;
  }

  /**
   * Initialize the Master connection.
   *
   * @return {Promise} A promise to wait for
   */
  init() {
    log.debug('Master listener instantiating WS server.');
    this[_wss] = new WebSocketServer(this[_host], this[_port]);
    this[_wss].registerMaster(this);

    return this[_wss].init();
  }

  registerManager(manager) {
    this[_manager] = manager;
  }

  handleMessage(sparkId, message) {
    if (message) {
      if (message.type === 'online') {
        log.debug(`Client connected: ${sparkId}`);
        this[_clients].set(sparkId, {sparkId: sparkId, maxMem: message.data.maxMem});
      } else if(this[_manager]) {
        log.debug('Propagating message up to the manager.');
        this[_manager].handleMessage(message);
      }
    }
  }

  clientDisconnected(sparkId) {
    log.debug(`Client disconnected: ${sparkId}`);
    this[_clients].delete(sparkId);
  }

  get clients() {
    return this[_clients];
  }

  sendMessage(clientId, message) {
    log.debug('Master listener sending message: ', message);
    return this[_wss].sendMessage(clientId, message);
  }

  shutdown() {
    log.debug('Master listener shutting down.');
    return this[_wss].shutdown();
  }
}

module.exports = MasterListener;
