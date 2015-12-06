import io from "socket.io-client";

export class WS {
  constructor() {
    this.socket = io('http://localhost:3000/live/');

    this.socket.on( 'message', function( event ) {
      console.log( 'chat message:', event )
    });
  }

  sendMessage(message) {
    this.socket.emit('data', message);
  }
}
