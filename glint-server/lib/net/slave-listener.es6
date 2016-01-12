import axon from 'axon';

import { getLog } from '../util/log.es6';

export class SlaveListener {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.sock = axon.socket('req');
    this.log = getLog();

    this.handlers = new Map();
  }

  init() {
    this.log.debug('Binding slave requester to %s:%s', this.host, this.port);
    this.sock.connect(this.port, this.host);

    this.sock.on('message', body => {
      this.log.debug('Slave handling message %j', body);

      if (body && body.type) {
        // check the handlers
        const handler = this.handlers.get(body.type);
        if (handler === undefined) {
          this.log.warn('Message for type %s arrived, but no handler registered.  Ignoring.', body.type);
        } else {
          this.log.debug('Processing message of type %s', body.type);
          handler(body);
        }
      }
    });
  }

  addMessageHandler(type, handler) {
    this.handlers.set(type, handler);
  }
}
