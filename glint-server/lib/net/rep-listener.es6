import axon from 'axon';

export class ResponseListener {
  constructor(host, port) {
    this.sock = axon.socket('rep');

    this.sock.connect(port, host);
  }

  consume() {
    this.sock.on('message', function(task, img, reply){
      switch (task) {
        case 'resize':
          // resize the image
          reply(img);
          break;
      }
    });
  }
}
