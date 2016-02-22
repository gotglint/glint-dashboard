import getLog from '../util/log';
const log = getLog();

import { MasterListener } from '../net/master-listener';
import { GlintExecutor } from './executor';

export class GlintManager {
  constructor(host, port) {
    log.debug('Master initializing; binding to %s:%d', host, port);
    this.masterListener = new MasterListener(host, port);

    this.glintExecutor = new GlintExecutor(this.masterListener);
  }

  /**
   * Initialize the Glint Manager; connecting the master listener to the broker.
   *
   * @returns {Promise} A promise to wait on
   */
  init() {
    try {
      log.debug('Master listener created, initializing.');
      return this.masterListener.init();
    } catch (error) {
      log.error('Could not initialize master listener: ', error);
      return Promise.reject(new Error('Could not initialize master listener.'));
    }
  }

  /**
   * Shutdown the Glint Manager; disconnect the master listener from the broker.
   *
   * @returns {Promise} A promise to wait on
   */
  shutdown() {
    log.debug('Glint manager shutting down.');

    return this.masterListener.shutdown();
  }

  /**
   * Execute a job, distributing data across nodes, etc.
   *
   * @param data The job data
   *
   * @returns {Promise} A promise to wait on
   */
  processJob(data) {
    return this.glintExecutor.execute(data);
  }
}
