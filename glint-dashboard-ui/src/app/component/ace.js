import ace from 'brace';
import 'brace/theme/monokai';
import 'brace/mode/javascript';
import 'brace/worker/javascript';

import {inject, bindable} from 'aurelia-framework';
import {ObserverLocator} from 'aurelia-binding';

@inject(ObserverLocator)
export class Ace {
  @bindable value = '';
  editor = null;

  constructor(observerLocator) {
    this.subscriptions = [
      observerLocator
        .getObserver(this, 'value')
        .subscribe(newValue => this.editor && this.editor.setValue(newValue))
    ];
  }

  attached() {
    const editor = ace.edit('editor');
    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');

    editor.on('change', () => {
      this.value = editor.getValue();
    });

    editor.setValue(this.value);

    window.ace = this;
  }

  detached() {
    this.editor.destroy();
  }
}
