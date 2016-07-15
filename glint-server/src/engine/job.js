const log = require('../util/log');

const dataSourceFactory = require ('../datasource/datasource-factory');
const uuid = require('node-uuid');

const _id = Symbol('id');
const _manager = Symbol('manager');
const _master = Symbol('master');
const _jobData = Symbol('jobData');
const _dataSource = Symbol('dataSource');

class GlintJob {
  constructor(manager, master, jobData) {
    this[_id] = uuid.v4();

    this[_manager] = manager;
    this[_master] = master;

    this[_jobData] = jobData;
    this[_dataSource] = dataSourceFactory.getDataSource(this[_jobData]);
  }

  get id() {
    return this[_id];
  }

  get data() {
    return this[_jobData].data;
  }

  get operations() {
    return this[_jobData].operations;
  }

  /**
   * Used to take a wild guess at how big the data will in memory;
   * used to calculate the scaling heuristic by acting as a baseline.
   */
  getProjectedSize() {
    return this[_dataSource].getSize();
  }

  /**
   * Act as a pointer to the specific place in the dataset
   */
  getNextBlock(maxMem) {
    log.debug(`Getting next block with max size ${maxMem}`);
    return this[_dataSource].getNextBlock(maxMem);
  }

  /**
   * Tell us how much data is left to process
   */
  get hasMoreBlocks() {
    const hasNextBlock = this[_dataSource].hasNextBlock();
    log.debug(`Checking to see if there is another block of data for this job: ${hasNextBlock}`);
    return hasNextBlock;
  }

  /**
   * Make sure that we can actually run this job
   */
  validate() {
    const jd = this[_jobData];
    if (!jd.hasOwnProperty('id')) {
      log.error('Job is not valid - missing an ID.');
      return false;
    }

    if (!jd.hasOwnProperty('data')) {
      log.error('Job is not valid - missing a data source.');
      return false;
    }

    if (!jd.hasOwnProperty('operations')) {
      log.error('Job is not valid - no operations were provided.');
      return false;
    }

    if (!Array.isArray(jd.operations)) {
      log.error('Job is not valid - operations provided were not an array.');
      return false;
    }

    return true;
  }
}

module.exports = GlintJob;
