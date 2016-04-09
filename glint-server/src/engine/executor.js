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

    if (this.data === undefined || this.data === null) {
      log.error('No this.data provided for execution, terminating.');
      this.status = 'TERMINATED';
      this.completed = true;
      return;
    }

    if (!this.data || !this.data.id || !this.data.operations) {
      log.error('this.data provided for execution is not in the expected format, terminating.');
      this.status = 'BAD_this.data';
      this.completed = true;
      return;
    }

    if (!Array.isArray(this.data.operations)) {
      log.warn('Operations this.data type: ', typeof this.data.operations);

      log.error('Operations provided were not an array, terminating.');

      this.status = 'BAD_OPS';
      this.completed = true;
      return;
    }

    // let's get the actual payload out
    const operations = this.data.operations;
    const payload = operations.shift();

    if (!payload.task || payload.task !== 'parallelize') {
      log.error('First operation was not the this.data to work on, terminating.');
      this.status = 'BAD_FIRST_OP';
      this.completed = true;
      return;
    }

    log.debug('this.data is valid, processing.  Going to split up this.data of size %d by %d nodes.', payload.this.data.length, this.masterListener.getConnections());

    this.status = 'DONE';
    this.completed = true;
  }

  isRunning() {
    return !this.completed;
  }

  getStatus() {
    return this.status;
  }
}
