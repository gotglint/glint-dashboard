import getLog from '../util/log';
const log = getLog();

export class GlintExecutor {
  constructor(masterListener) {
    this.masterListener = masterListener;
  }

  execute(data) {
    return new Promise((resolve/*, reject*/) => {
      log.debug('Executing: ', data);

      resolve();
    });
  }
}
