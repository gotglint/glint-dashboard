import getLog from '../util/log';
const log = getLog();

export class GlintExecutor {
  constructor() {
    // empty
  }

  execute(script) {
    log.debug('Executing: ', script);
  }
}
