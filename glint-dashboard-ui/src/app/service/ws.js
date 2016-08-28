import {getLogger} from 'aurelia-logging';

import {JSONfn} from 'jsonfn';

export class WS {
  constructor() {
    this.log = getLogger('ws');
    this.primus = new Primus();
    this.callbacks = new Map();

    const log = this.log;

    this.primus.on('data', (data) => {
      const deserialized = JSONfn.parse(data);
      log.debug('data: ', deserialized);

      if (deserialized && deserialized.type) {
        if (this.callbacks.has(deserialized.type)) {
          this.callbacks.get(deserialized.type)(deserialized.result);
        }
      }
    });
  }

  sendMessage(endpoint, message) {
    this.log.debug('Sending message to ', endpoint, message);
    this.primus.write(JSONfn.stringify({type: endpoint, message: message}));
  }

  subscribe(endpoint, callback) {
    this.callbacks.set(endpoint, callback);
  }
}
