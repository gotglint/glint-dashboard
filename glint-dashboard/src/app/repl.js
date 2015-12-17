import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';

import { WS } from './service/ws';

@inject(WS)
export class Repl {
  constructor(ws) {
    this.ws = ws;
    this.log = getLogger('repl');

    this.replInput = 'test';
    this.replOutput = '';
  }

  attached() {
    this.ws.subscribe('repl', data => {
      this.log.debug('REPL repl message: ', data);

      this.replOutput += JSON.stringify(data);
    });

    this.ws.sendMessage('repl', 'init');
  }

  run() {
    this.log.debug('Executing REPL: ', this.replInput);
    
    this.ws.sendMessage('repl', this.replInput);
  }
}
