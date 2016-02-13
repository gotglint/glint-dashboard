import zmq from 'zmq';
import Promise from 'bluebird';

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
    return new Promise((resolve, reject) => {
      log.debug('Binding master listener to %s:%s', this.host, this.port);
      this.broker.bind('tcp://' + this.host + ':' + this.port, (err) => {
        if (err) {
          log.warn('Could not bind master listener: ', err);
          return reject(err);
        }

        this.broker.on('message', (identity, delimiter, _data) => {
          try {
            const data = JSON.parse(_data);
            log.debug('Master handling message: %s %j', identity, data);

            log.debug("Data type: ", data.type);

            switch (data.type) {
              case "online":
                log.debug('Node coming online: ', data);
                this.distributeMessage(identity, {"test": "hi"});
                break;
            }
          } catch (err) {
            log.error('Could not process message: ', err);
          }
        });

        return resolve();
      });
    });
  }

  enableDebug() {
    log.debug('Enabling debug mode in the master listener.');
    this.broker.on('connect', function (fd, ep) {
      log.debug('connect, endpoint:', ep);
    });
    this.broker.on('connect_delay', function (fd, ep) {
      log.debug('connect_delay, endpoint:', ep);
    });
    this.broker.on('connect_retry', function (fd, ep) {
      log.debug('connect_retry, endpoint:', ep);
    });
    this.broker.on('listen', function (fd, ep) {
      log.debug('listen, endpoint:', ep);
    });
    this.broker.on('bind_error', function (fd, ep) {
      log.debug('bind_error, endpoint:', ep);
    });
    this.broker.on('accept', function (fd, ep) {
      log.debug('accept, endpoint:', ep);
    });
    this.broker.on('accept_error', function (fd, ep) {
      log.debug('accept_error, endpoint:', ep);
    });
    this.broker.on('close', function (fd, ep) {
      log.debug('close, endpoint:', ep);
    });
    this.broker.on('close_error', function (fd, ep) {
      log.debug('close_error, endpoint:', ep);
    });
    this.broker.on('disconnect', function (fd, ep) {
      log.debug('disconnect, endpoint:', ep);
    });

    this.broker.on('monitor_error', function (err) {
      log.error('Error in master monitoring: %s', err);
    });

    log.debug('Turning on master ZMQ monitoring.');
    this.broker.monitor(500, 0);

    log.debug('Master listener debug mode enabled.');
  }

  distributeMessage(node, body) {
    log.debug('Sending message to %s of type %s with content %j', node, body);
    this.broker.send([node, '', JSON.stringify(body)]);
  }

  shutdown() {
    log.debug('Shutting down master listener.');
    this.broker.close();
  }
}
