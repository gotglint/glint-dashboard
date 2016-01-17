import zmq from 'zmq';

import getLog from '../util/log.es6';
const log = getLog();

export class MasterListener {
  constructor(host, port) {
    log.debug('Master listener constructor firing.');

    this.host = host;
    this.port = port;

    log.debug('Creating master ZMQ socket.');
    this.broker = zmq.socket('router');
  }

  async init() {
    log.debug('Binding master listener to %s:%s', this.host, this.port);
    await this.broker.bind('tcp://' + this.host + ':' + this.port);

    this.broker.on('message', (identity, delimiter, data) => {
      var asJson = JSON.parse(data);
      log.debug('Master handling message: %s %s %j', identity, delimiter, asJson);
    });
  }

  enableDebug() {
    log.debug('Enabling debug mode in the master listener.');
    this.broker.on('connect', function(fd, ep) {log.debug('connect, endpoint:', ep);});
    this.broker.on('connect_delay', function(fd, ep) {log.debug('connect_delay, endpoint:', ep);});
    this.broker.on('connect_retry', function(fd, ep) {log.debug('connect_retry, endpoint:', ep);});
    this.broker.on('listen', function(fd, ep) {log.debug('listen, endpoint:', ep);});
    this.broker.on('bind_error', function(fd, ep) {log.debug('bind_error, endpoint:', ep);});
    this.broker.on('accept', function(fd, ep) {log.debug('accept, endpoint:', ep);});
    this.broker.on('accept_error', function(fd, ep) {log.debug('accept_error, endpoint:', ep);});
    this.broker.on('close', function(fd, ep) {log.debug('close, endpoint:', ep);});
    this.broker.on('close_error', function(fd, ep) {log.debug('close_error, endpoint:', ep);});
    this.broker.on('disconnect', function(fd, ep) {log.debug('disconnect, endpoint:', ep);});

    this.broker.on('monitor_error', function(err) {
      log.error('Error in master monitoring: %s', err);
    });

    log.debug('Turning on master ZMQ monitoring.');
    this.broker.monitor(500, 0);

    log.debug('Master listener debug mode enabled.');
  }

  distributeMessage(node, type, body) {
    log.debug('Sending message of type %s with content %j to %s', type, body, node);
    this.broker.send([node, '', 'Work harder']);
  }

  shutdown() {
    log.debug('Shutting down master listener.');
    this.broker.close();
  }
}
