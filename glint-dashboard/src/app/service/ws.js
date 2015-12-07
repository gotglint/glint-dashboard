import io from "socket.io-client";

import {getLogger} from 'aurelia-logging';

export class WS {
  constructor() {
    this.log = getLogger('ws');
    this.socket = io();

    const sock = this.socket;
    const log = this.log;

    this.socket.on('connect', () => {
      log.debug('connected.');
    });
  }

  sendMessage(endpoint, message) {
    this.log.debug('Sending message to ', endpoint, message);
    this.socket.emit(endpoint, message);
  }
}
