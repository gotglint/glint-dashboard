const log = require('../util/log');
const bson = require('bson');

const MasterListener = require('../listener/master-listener');
const GlintExecutor = require('./executor');
const GlintJob = require('./job');

const _bson = Symbol('bson');
const _jobs = Symbol('jobs');
const _master = Symbol('master');

/**
 * The brains of the master - actually controls all of the jobs and schedules and and and.
 */
class GlintManager {
  constructor(host, port) {
    log.debug('Master initializing; binding to %s:%d', host, port);
    this[_master] = new MasterListener(host, port);

    this[_bson] = new bson.BSONPure.BSON();
    this[_jobs] = new Map();
  }

  /**
   * Initialize the Glint Manager; connecting the master listener to the broker.
   *
   * @returns {Promise} A promise to wait on
   */
  init() {
    try {
      log.debug('Master listener created, initializing.');
      return this[_master].init();
    } catch (error) {
      log.error('Could not initialize master listener: ', error);
      return Promise.reject(new Error('Could not initialize master listener.'));
    }
  }

  /**
   * Shutdown the Glint Manager; disconnect the master listener = require(the broker.
   *
   * @returns {Promise} A promise to wait on
   */
  shutdown() {
    log.debug('Glint manager shutting down.');

    return this[_master].shutdown();
  }

  /**
   * Execute a job, distributing data across nodes, etc.
   *
   * @param data The job data
   *
   * @returns {Promise} A promise to wait on
   */
  processJob(data) {
    const deserialized = this[_bson].deserialize(data, {evalFunctions: true, cacheFunctions: true});
    const job = new GlintJob(this, this[_master], deserialized);

    const glintExecutor = new GlintExecutor(this[_master], job);

    const jobId = glintExecutor.getId();
    log.debug(`Job ID: ${jobId}`);

    this[_jobs].set(jobId, glintExecutor);

    return glintExecutor.execute();
  }
}

module.exports = GlintManager;
