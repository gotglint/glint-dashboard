import {LogManager} from 'aurelia-framework';
import {ConsoleAppender} from 'aurelia-logging-console';

import 'bootstrap';
import 'font-awesome';

import 'bootstrap/css/bootstrap.min.css!';
import 'font-awesome/css/font-awesome.min.css!';

import 'uzairfarooq/arrive';

import 'bootstrap-material-design/dist/css/material-fullpalette.min.css!';
import 'bootstrap-material-design/dist/css/ripples.min.css!';
import 'bootstrap-material-design/dist/css/roboto.min.css!';

LogManager.addAppender(new ConsoleAppender());
LogManager.setLevel(LogManager.logLevel.debug);

export function configure(aurelia) {
  aurelia.use
    .defaultBindingLanguage()
    .defaultResources()
    .history()
    .router()
    .eventAggregator();

  aurelia.start().then(() => aurelia.setRoot('app', document.body));
}
