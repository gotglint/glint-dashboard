import getLog from '../util/log';
const log = getLog();

export default class GlintExecutor {
  constructor(masterListener, data) {
    this.masterListener = masterListener;
    this.data = data;

    this.completed = false;
    this.status = null;
  }

  execute() {
    log.debug('Executing: ', this.data);

    return new Promise((resolve, reject) => {
      if (this.data === undefined || this.data === null) {
        log.error('No this.data provided for execution, terminating.');
        this.status = 'TERMINATED';
        this.completed = true;
        return reject('No this.data provided for execution, terminating.');
      }

      if (!this.data || !this.data.id || !this.data.operations) {
        log.error('this.data provided for execution is not in the expected format, terminating.');
        this.status = 'BAD_this.data';
        this.completed = true;
        return reject('this.data provided for execution is not in the expected format, terminating.');
      }

      if (!Array.isArray(this.data.operations)) {
        log.warn('Operations this.data type: ', typeof this.data.operations);

        log.error('Operations provided were not an array, terminating.');

        this.status = 'BAD_OPS';
        this.completed = true;
        return reject('Operations provided were not an array, terminating.');
      }

      // let's get the actual payload out
      const operations = this.data.operations;
      const payload = operations.shift();

      if (!payload.task || payload.task !== 'parallelize') {
        log.error('First operation was not the this.data to work on, terminating.');
        this.status = 'BAD_FIRST_OP';
        this.completed = true;
        return reject('First operation was not the this.data to work on, terminating.');
      }

      log.debug('this.data is valid, processing.  Going to split up this.data of size %d.', payload.data.length);

      this.status = 'DONE';
      this.completed = true;
      resolve(true);
    });
  }

  isRunning() {
    return !this.completed;
  }

  getStatus() {
    return this.status;
  }
}
