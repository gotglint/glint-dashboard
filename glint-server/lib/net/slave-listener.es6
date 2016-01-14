import zmq from 'zmq';
import uuid from 'node-uuid';

import getLog from '../util/log.es6';

export class SlaveListener {
  constructor(host, port) {
    this.host = host;
    this.port = port;

    this.log = getLog();

    this.handlers = new Map();

    this.dealer = zmq.socket('dealer');
    this.dealer.identity = uuid.v4();
  }

  init() {
    this.log.debug('Binding slave requester to %s:%s', this.host, this.port);
    this.dealer.connect('tcp://' + this.host + ':' + this.port);

    //  Get workload from broker, until finished
    this.dealer.on('message', function onMessage() {
      var args = Array.apply(null, arguments);

      var workload = args[1].toString('utf8');
      this.log.debug('Slave handling message %j', workload);

      /*if (body && body.type) {
        // check the handlers
        const handler = this.handlers.get(body.type);
        if (handler === undefined) {
          this.log.warn('Message for type %s arrived, but no handler registered.  Ignoring.', body.type);
        } else {
          this.log.debug('Processing message of type %s', body.type);
          handler(body);
        }
      }*/
    });

    //  Tell the broker we're ready for work
    this.sendMessage();
  }

  addMessageHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  sendMessage() {
    this.dealer.send(['', {type:online}]);
  }

  shutdown() {
    this.dealer.removeListener('message', onMessage);
    this.dealer.close();
  }
}
