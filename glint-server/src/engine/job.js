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
