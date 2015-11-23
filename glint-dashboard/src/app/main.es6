import {LogManager} from 'aurelia-framework';
import {ConsoleAppender} from 'aurelia-logging-console';

import 'bootstrap';
import 'font-awesome';

import 'uzairfarooq/arrive';
import 'FezVrasta/bootstrap-material-design';

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
