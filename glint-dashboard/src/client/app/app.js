import 'bootstrap-material-design/dist/js/material.min';

import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';

import { WS } from './service/ws';

@inject(WS)
export class App {
  constructor(ws) {
    this.ws = ws;
    this.log = getLogger('app');
  }

  configureRouter(config, router) {
    config.title = 'Glint Dashboard';
    config.map([
      {route: ['', 'home'], name: 'home', moduleId: 'app/home', nav: true, title: 'Home'},
      {route: ['/repl', 'repl'], name: 'repl', moduleId: 'app/repl', nav: true, title: 'REPL'}
    ]);

    this.router = router;
    this.log.debug('Configured router.');
  }

  attached() {
    this.log.debug('Instantiating bootstrap material.');
    $.material.init();
  }
}
