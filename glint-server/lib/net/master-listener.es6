import zmq from 'zmq';

import getLog from '../util/log.es6';
const log = getLog();

export class MasterListener {
  constructor(host, port) {
    log.debug('Master listener constructor firing.');

    this.host = host;
    this.port = port;

    log.debug('Creating ZMQ socket.');
    this.broker = zmq.socket('router');
  }

  async init() {
    log.debug('Binding listener to %s:%s', this.host, this.port);
    await this.broker.bind('tcp://' + this.host + ':' + this.port);

    this.broker.on('message', () => {
      var args = Array.apply(null, arguments), identity = args[0], message = args[1].toString('utf8');

      log.debug('Got a message from %s - %s', identity, message);
    });
  }

  enableDebug() {
    log.debug('Enabling debug mode in the master listener.');
    this.broker.on('connect', function(fd, ep) {console.log('connect, endpoint:', ep);});
    this.broker.on('connect_delay', function(fd, ep) {console.log('connect_delay, endpoint:', ep);});
    this.broker.on('connect_retry', function(fd, ep) {console.log('connect_retry, endpoint:', ep);});
    this.broker.on('listen', function(fd, ep) {console.log('listen, endpoint:', ep);});
    this.broker.on('bind_error', function(fd, ep) {console.log('bind_error, endpoint:', ep);});
    this.broker.on('accept', function(fd, ep) {console.log('accept, endpoint:', ep);});
    this.broker.on('accept_error', function(fd, ep) {console.log('accept_error, endpoint:', ep);});
    this.broker.on('close', function(fd, ep) {console.log('close, endpoint:', ep);});
    this.broker.on('close_error', function(fd, ep) {console.log('close_error, endpoint:', ep);});
    this.broker.on('disconnect', function(fd, ep) {console.log('disconnect, endpoint:', ep);});

    this.broker.on('monitor_error', function(err) {
      console.log('Error in monitoring: %s', err);
    });

    log.debug('Turning on ZMQ monitoring.');
    this.broker.monitor(500, 0);

    log.debug('Master listener debug mode enabled.');
  }

  distributeMessage(node, type, body) {
    this.broker.send([identity, '', 'Work harder']);
  }

  shutdown() {
    this.broker.close();
  }
}
