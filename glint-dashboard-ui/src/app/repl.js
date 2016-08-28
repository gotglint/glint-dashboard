import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';

import {JSONfn} from 'jsonfn';

import { WS } from './service/ws';

@inject(WS)
export class Repl {
  constructor(ws) {
    this.ws = ws;
    this.log = getLogger('repl');

    this.replInput = `const input = [...new Array(5).keys()].slice(1);

this.glintClient.parallelize(input).map(function(el) {
  return el + 324;
}).filter(function(el, idx) {
  return !!(el === 325 || idx === 2);
});`;
    this.replOutput = '';
  }

  attached() {
    this.ws.subscribe('result', (data) => {
      this.log.debug('REPL message: ', data);

      this.replOutput += JSONfn.stringify(data);
    });
  }

  run() {
    this.log.debug('Executing REPL: ', this.replInput);

    this.ws.sendMessage('repl', {blob: this.replInput});
  }
}
