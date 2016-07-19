const uuid = require('node-uuid');

const log = require('../util/log').getLogger('job');
const dataSourceFactory = require ('../datasource/datasource-factory');
const operationUtils = require('../util/operation-utils');

const _id = Symbol('id');

const _manager = Symbol('manager');
const _master = Symbol('master');

const _jobData = Symbol('jobData');
const _steps = Symbol('steps');

const _dataSource = Symbol('dataSource');
const _stepResults = Symbol('stepResults');

const _blocks = Symbol('blocks');
const _results = Symbol('results');

class GlintJob {
  constructor(manager, master, jobData) {
    this[_id] = uuid.v4();

    this[_manager] = manager;
    this[_master] = master;

    this[_jobData] = jobData;
    this[_steps] = operationUtils.splitOperations(jobData.operations);
    log.debug('Operations split up into proper chunks: ', this[_steps]);

    this[_dataSource] = dataSourceFactory.getDataSource(this[_jobData]);
    this[_stepResults] = [];

    this[_blocks] = new Map();
    this[_results] = [];
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

  _createBlock(block, step) {
    const newBlockId = uuid.v4();
    const fullBlock = {blockId: newBlockId, type: 'job', jobId: this[_id], block: block, operations: this[_steps][step], step: step};
    this[_blocks].set(newBlockId, fullBlock);
    return fullBlock;
  }

  /**
   * Act as a pointer to the specific place in the dataset
   */
  getNextBlock(maxMem) {
    log.debug(`Getting next block with max size ${maxMem}`);

    if (this[_dataSource].hasNextBlock()) {
      log.debug('Consuming block from data source.');
      let block = this[_dataSource].getNextBlock(maxMem);
      block = block.filter((e) => {
        return e === 0 || e;
      });
      return this._createBlock(block, 0);
    } else if (this[_stepResults].length > 0) {
      log.debug('Consuming block from prior step.');
    }
  }

  /**
   * Tell us how much data is left to process
   */
  hasMoreBlocks() {
    const hasNextBlock = this[_dataSource].hasNextBlock();
    log.debug(`Checking to see if there is another block of data for this job: ${hasNextBlock}`);

    if (!hasNextBlock) {
      log.debug('Datasource has no more blocks, checking to see if we have step results to process.');
      return this[_stepResults].length > 0;
    } else {
      log.debug('Datasource has more blocks.');
      return true;
    }
  }

  /**
   * A block (data + set of operations) finished being processed somewhere
   * @param block
   */
  blockCompleted(block) {
    const blockId = block.blockId;
    const blockExists = this[_blocks].has(blockId);
    if (blockExists === true) {
      log.debug(`Block ${blockId} came back from a slave.`);

      this[_blocks].delete(blockId);
      log.debug(`Removed ${blockId} from the list of outstanding blocks.`);

      // check to see if there were more steps
      const step = block.step;
      if (step === this[_steps].length - 1) {
        // we're done
        log.debug('Block was at the end of a chain, nothing more to do.');
        this[_results] = this[_results].concat(block.block);
        return;
      }

      // let's add the data that came back as a new block
      log.debug('Block had results, adding it to the results for further processing.');
      this[_stepResults].push({step: block.step, data: block.block});
    } else {
      log.warn(`No block with ID ${blockId} exists in the system.`);
    }
  }

  isProcessing() {
    return this[_blocks].size > 0;
  }

  getResults() {
    return this[_results];
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
