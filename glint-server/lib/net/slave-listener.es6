import zmq from 'zmq';
import uuid from 'node-uuid';

import getLog from '../util/log.es6';
const log = getLog();

export class SlaveListener {
  constructor(host, port) {
    log.debug('Slave listener constructor firing.');
    this.host = host;
    this.port = port;

    this.handlers = new Map();

    log.debug('Creating slave ZMQ socket.');
    this.dealer = zmq.socket('dealer');
    this.dealer.setsockopt(zmq.ZMQ_RECONNECT_IVL, 500);
    this.dealer.setsockopt(zmq.ZMQ_RECONNECT_IVL_MAX, 30000);
    this.dealer.identity = uuid.v4();
    log.debug('Slave ZMQ socket created, assigned ID: ', this.dealer.identity);
  }

  init() {
    log.debug('Binding slave requester to %s:%s', this.host, this.port);
    this.dealer.connect('tcp://' + this.host + ':' + this.port);

    //  Get workload from broker, until finished
    this.dealer.on('message', (identity, delimiter, data) => {
      log.debug('Slave handling message: ', identity, delimiter, data);

      /*if (body && body.type) {
        // check the handlers
        const handler = this.handlers.get(body.type);
        if (handler === undefined) {
          log.warn('Message for type %s arrived, but no handler registered.  Ignoring.', body.type);
        } else {
          log.debug('Processing message of type %s', body.type);
          handler(body);
        }
      }*/
    });

    //  Tell the broker we're ready for work
    this.sendMessage({type: 'online'});
  }

  enableDebug() {
    log.debug('Enabling debug mode in the slave listener.');
    this.dealer.on('connect', function(fd, ep) {log.debug('connect, endpoint:', ep);});
    this.dealer.on('connect_delay', function(fd, ep) {log.debug('connect_delay, endpoint:', ep);});
    this.dealer.on('connect_retry', function(fd, ep) {log.debug('connect_retry, endpoint:', ep);});
    this.dealer.on('listen', function(fd, ep) {log.debug('listen, endpoint:', ep);});
    this.dealer.on('bind_error', function(fd, ep) {log.debug('bind_error, endpoint:', ep);});
    this.dealer.on('accept', function(fd, ep) {log.debug('accept, endpoint:', ep);});
    this.dealer.on('accept_error', function(fd, ep) {log.debug('accept_error, endpoint:', ep);});
    this.dealer.on('close', function(fd, ep) {log.debug('close, endpoint:', ep);});
    this.dealer.on('close_error', function(fd, ep) {log.debug('close_error, endpoint:', ep);});
    this.dealer.on('disconnect', function(fd, ep) {log.debug('disconnect, endpoint:', ep);});

    this.dealer.on('monitor_error', function(err) {
      log.error('Error in slave monitoring: %s', err);
    });

    log.debug('Turning on slave ZMQ monitoring.');
    this.dealer.monitor(500, 0);

    log.debug('Slave listener debug mode enabled.');
  }

  addMessageHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  sendMessage(message) {
    log.debug('Sending message: ', message);
    this.dealer.send(['', JSON.stringify(message)]);
  }

  shutdown() {
    log.debug('Shutting down slave listener.');
    this.dealer.removeListener('message', onMessage);
    this.dealer.close();
  }
}
