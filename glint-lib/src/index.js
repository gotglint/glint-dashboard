import uuid from 'node-uuid';
import bson from 'bson';

/** The way to invoke and interact with Glint */
export class GlintClient {
  /**
   * Constructor
   */
  constructor() {
    this.id = uuid.v4();
    this.bson = new bson.BSONPure.BSON();

    this.operations = [];
  }

  /**
   * Parallelize data - i.e. distribute it for work across a cluster.
   *
   * @param {Object} data - The data to spread across a cluster.  Will replace this with something more meaningful so that we don't have to spear a huge amount of data to the server.
   */
  parallelize(data) {
    this.operations.push({task: 'parallelize', data: data});

    return this;
  }

  /**
   * Extract or otherwise convert a specific subset of information from the source data.
   *
   * @param {function} fn - The function to execute to perform the extraction.  Must accept one parameter and return a value.
   */
  map(fn) {
    this.operations.push({task: 'map', data: fn});

    return this;
  }

  /**
   * Perform a summary operation on the data.
   *
   * @param {function} fn - The function to perform the sum.  Must accept two parameters (the sum and the data element) and return a value.
   */
  reduce(fn) {
    this.operations.push({task: 'reduce', data: fn});

    return this;
  }

  /**
   * Perform a comparison on a piece of information - if this function returns true, the information is passed through to the next stage of the pipeline.  If not, it is discarded.
   *
   * @param {function} fn - The function to execute to perform the filter.  Must accept one parameter and return a boolean value.
   */
  filter(fn) {
    this.operations.push({task: 'filter', data: fn});

    return this;
  }

  /**
   * Kick things off!
   *
   * @throws Will throw an error if there are no operations provided, or the first operation is not a parallelization task.
   */
  run() {
    if (this.operations === null || this.operations.length === 0) {
      throw new Error('No operations specified; nothing to run.');
    }

    if (this.operations[0].task !== 'parallelize') {
      throw new Error('To run any task requires data - please parallelize something first.');
    }

    // submit the info to the server, return a promise?  an ID?
  }

  /**
   * Not to be used by anything other than testing.
   *
   * // TODO make a test client that simply extends this class and adds getOperations there
   *
   * @returns {Object}
   */
  getData() {
    return this.bson.serialize({id: this.id, operations: this.operations}, true, false, true);
  }
}
