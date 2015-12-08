import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';

import { WS } from './service/ws';

@inject(WS)
export class Repl {
  constructor(ws) {
    this.ws = ws;
    this.log = getLogger('repl');
  }

  attached() {
    let parent = this;

    this.ws.subscribe('repl', function(ctx, data) {
      parent.log.debug('REPL message: ', ctx, data);
    });

    this.ws.subscribe('data', function(ctx, data) {
      parent.log.debug('REPL message: ', ctx, data);
    });

    this.ws.sendMessage('repl', 'init');
  }

  run() {
    this.log.debug('Executing REPL.');
  }
}
