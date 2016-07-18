const log = require('../util/log');
const uuid = require('node-uuid');
const operationUtils = require('../util/operation-utils');

const _master = Symbol('master');
const _job = Symbol('job');

const _status = Symbol('status');

const _blocks = Symbol('blocks');
const _steps = Symbol('steps');

const _promise = Symbol('promise');
const _resolve = Symbol('resolve');
const _reject = Symbol('reject');

/**
 * Encapsulation layer that corresponds to running an entire job
 */
class GlintExecutor {
  constructor(master, job) {
    this[_master] = master;
    this[_job] = job;

    this[_status] = null;

    this[_promise] = new Promise((resolve, reject) => {
      this[_resolve] = resolve;
      this[_reject] = reject;
    });

    this[_blocks] = new Set();
    this[_steps] = [];
  }

  execute() {
    if (this[_job] === undefined || this[_job] === null) {
      log.error('No job provided for execution, terminating.');
      this[_status] = 'TERMINATED';
      return this[_reject](new Error('No job provided for execution, terminating.'));
    }

    if (!this[_job].validate()) {
      this[_status] = 'BAD_JOB';
      return this[_reject](new Error('Job was not valid, terminating.'));
    }

    log.debug(`Executing: ${this[_job].id}`);
    this[_status] = 'PROCESSING';

    // split the job up into steps based on where reductions occur
    const operations = this[_job].operations;
    this[_steps] = operationUtils.splitOperations(operations);
    log.debug('Operations split up into proper chunks: ', this[_steps]);

    // send the initial packets out; if the job size is smaller than the number of workers,
    // we're good, let one node do all the work
    const clients = this[_master].clients;
    for (const client of clients.values()) {
      if (this[_job].hasMoreBlocks === true) {
        const blockId = uuid.v4();
        log.debug(`Sending block ${blockId} to client: ${client.sparkId} - ${client.maxMem}`);
        this[_master].sendMessage(client.sparkId, {blockId: blockId, type: 'job', jobId: this[_job].id, block: this[_job].getNextBlock(client.maxMem), operations: this[_steps][0]});
        this[_blocks].add(blockId);
      } else {
        log.debug('No more blocks to process, initial job distribution completed.');
        break;
      }
    }
  }

  getId() {
    return this[_job].id;
  }

  getPromise() {
    return this[_promise];
  }

  handleMessage(message) {
    log.debug('Executor handling message: ', message);
    if (message && message.blockId) {
      this.handleBlockProcessed(message.blockId);
    }
  }

  handleBlockProcessed(blockId) {
    log.debug(`Processing block ${blockId}`);
    if (this[_blocks].has(blockId)) {
      log.debug(`Block ${blockId} came back from a slave.`);

      this[_blocks].delete(blockId);
      log.debug(`Removed ${blockId} from the list of outstanding blocks.`);

      if (this[_blocks].size === 0) {
        log.debug('All blocks processed.');
        this[_resolve]('All done.');
      } else {
        log.debug(`There are still ${this[_blocks].size} blocks to process.`);
      }
    }
  }
}

module.exports = GlintExecutor;
