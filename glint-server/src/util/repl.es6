import log from 'intel';
import util from 'util';
import vm from 'vm';

export class REPL {
  constructor() {
    // empty
  }

  static getRuntimeInfo() {
    return {
      proc: process.versions
    }
  }
}
