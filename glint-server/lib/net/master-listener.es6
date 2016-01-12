import axon from 'axon';

import getLog from '../util/log.es6';

export class MasterListener {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.sock = axon.socket('rep');
    this.log = getLog();
  }

  init() {
    this.log.debug('Binding listener to %s:%s', this.host, this.port);
    this.sock.bind(this.port, this.host);
  }

  distributeMessage(type, body) {
    this.sock.send({type: type, body: body});
  }
}
