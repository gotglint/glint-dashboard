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
    log.debug(`Executing: ${this[_job]}`);

    return new Promise((resolve, reject) => {
      if (this[_job] === undefined || this[_job] === null) {
        log.error('No job provided for execution, terminating.');
        this[_status] = 'TERMINATED';
        this[_completed] = true;
        return reject('No job provided for execution, terminating.');
      }

      if (!this[_job].validate()) {
        this[_status] = 'BAD_JOB';
        this[_completed] = true;
        return reject('Job was not valid, terminating.');
      }

      // let's get the actual payload out
      const data = this[_job].data;
      log.debug(`Job is valid, processing.  Going to split up data of size ${data.length}`);

      // let's see how big the data is
      const rowSize = this[_job].getProjectedSize();
      log.debug(`Row size: ${rowSize}`);

      // okay, now to see how many listeners we have, and how much data each can consume, and then spread across
      const clients = this[_master].clients;
      log.debug(`Spreading job across ${clients.size} slaves.`);

      clients.forEach((client) => {
        log.debug(`Client: ${client.spark.id} - ${client.maxMem}`);
      });

      this[_status] = 'DONE';
      this[_completed] = true;
      resolve(true);
    });
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
