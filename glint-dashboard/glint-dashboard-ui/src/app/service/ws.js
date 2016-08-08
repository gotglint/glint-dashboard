import {getLogger} from 'aurelia-logging';

export class WS {
  constructor() {
    this.log = getLogger('ws');
    this.primus = new Primus();

    const log = this.log;

    this.primus.on('data', (data) => {
      log.debug('data: ', data);
    });
  }

  sendMessage(endpoint, message) {
    this.log.debug('Sending message to ', endpoint, message);
    this.primus.emit(endpoint, message);
  }

  subscribe(endpoint, callback) {
    this.primus.on(endpoint, (ctx, data) => {
      callback(ctx, data);
    });
  }
}
