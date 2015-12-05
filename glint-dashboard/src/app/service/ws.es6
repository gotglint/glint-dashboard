import 'socket.io-client';

export class WS {
  constructor() {
    this.socket = io();
  }
}
