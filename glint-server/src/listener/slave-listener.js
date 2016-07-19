const log = require('../util/log').getLogger('slave');
const WebSocketClient = require('../net/ws-client');

const _host = Symbol('host');
const _port = Symbol('port');
const _maxMem = Symbol('maxMem');
const _ws = Symbol('ws');

class SlaveListener {
  constructor(host, port, maxMem) {
    log.debug(`Slave listener constructor firing, connecting to ${host}:${port} - using ${maxMem} as the memory limit`);

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
    this[_ws].registerSlave(this);

    return this[_ws].init().then(() => {
      log.debug('Slave listener created WS client.');
      return this.sendMessage('online', {maxMem: this[_maxMem]});
    }).catch((err) => {
      log.error(`Slave listener could not connect to WS server: ${err}`);
      return Promise.reject(err);
    });
  }

  handleMessage(message) {
    log.debug('Slave listener handling message: ', message);

    if (message && message.type && message.type === 'job') {
      log.debug('Handling job request.');

      let block = message.block;

      const operations = message.operations;
      for (const op of operations) {
        switch (op.task) {
          case 'map':
            log.debug('Slave running map - input: ', block);
            block = block.map(op.data);
            log.debug('Map results: ', block);
            break;
          case 'filter':
            log.debug('Slave running filter - input: ', block);
            block = block.filter(op.data);
            log.debug('Filter results: ', block);
            break;
          case 'reduce':
            log.debug('Slave running reduce - input: ', block);
            block = block.reduce(op.data);
            log.debug('Reduce results: ', block);
            break;
          default:
            log.warn(`Slave provided unknown task (${op.task}), ignoring.`);
        }
      }

      log.debug('Sending message back to server: ', block);
      this.sendMessage('block-response', {clientId: this[_ws].id, blockId: message.blockId, block:block, jobId: message.jobId, step: message.step});
    }
  }

  sendMessage(type, message) {
    log.debug('Slave listener sending message.');
    return this[_ws].sendMessage({type: type, data: message});
  }

  shutdown() {
    log.debug('Slave listener shutting down.');
    return this[_ws].shutdown();
  }
}

module.exports = SlaveListener;
