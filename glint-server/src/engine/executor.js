import getLog from '../util/log';
const log = getLog();

export class GlintExecutor {
  constructor(masterListener) {
    this.masterListener = masterListener;
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      log.debug('Executing: ', data);

      if (data === undefined || data === null) {
        log.error('No data provided for execution, terminating.');
        return reject(new Error('No data provided for execution, terminating.'));
      }

      if (!data || !data.id || !data.operations) {
        log.error('Data provided for execution is not in the expected format, terminating.');
        return reject(new Error('Data provided for execution is not in the expected format, terminating.'));
      }

      if (!Array.isArray(data.operations)) {
        log.warn('Operations data type: ', typeof data.operations);

        log.error('Operations provided were not an array, terminating.');
        return reject(new Error('Operations provided were not an array, terminating.'));
      }

      // let's get the actual payload out
      const operations = data.operations;
      const payload = operations.shift();

      if (!payload.task || payload.task !== 'parallelize') {
        log.error('First operation was not the data to work on, terminating.');
        return reject(new Error('First operation was not the data to work on, terminating.'));
      }

      log.debug('Data is valid, processing.  Going to split up data of size %d by %d nodes.', payload.data.length, this.masterListener.getConnections());

      resolve();
    });
  }
}
