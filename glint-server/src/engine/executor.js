const log = require('../util/log');

const _master = Symbol('master');
const _job = Symbol('job');

const _completed = Symbol('completed');
const _status = Symbol('status');

/**
 * Encapsulation layer that corresponds to running an entire job
 */
class GlintExecutor {
  constructor(master, job) {
    this[_master] = master;
    this[_job] = job;

    this[_completed] = false;
    this[_status] = null;
  }

  execute() {
    if (this[_job] === undefined || this[_job] === null) {
      log.error('No job provided for execution, terminating.');
      this[_status] = 'TERMINATED';
      this[_completed] = true;
      throw new Error('No job provided for execution, terminating.');
    }

    if (!this[_job].validate()) {
      this[_status] = 'BAD_JOB';
      this[_completed] = true;
      throw new Error('Job was not valid, terminating.');
    }

    log.debug(`Executing: ${this[_job].id}`);
    this[_status] = 'PROCESSING';

    // send the initial packets out; if the job size is smaller than the number of workers,
    // we're good, let one node do all the work
    const clients = this[_master].clients;
    for (const client of clients.values()) {
      if (this[_job].hasMoreBlocks === true) {
        log.debug(`Sending a block to client: ${client.spark.id} - ${client.maxMem}`);
        client.spark.write({job:this[_job].id, block: this[_job].getNextBlock(client.maxMem)});
      } else {
        log.debug('No more blocks to process, job distribution completed.');
        break;
      }
    }
  }

  isRunning() {
    return !this[_completed];
  }

  getStatus() {
    return this[_status];
  }

  getId() {
    return this[_job].id;
  }
}

module.exports = GlintExecutor;
