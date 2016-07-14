const log = require('../util/log');
const sizeof = require('object-sizeof');

const Datasource = require('./datasource');

class InMemoryDatasource extends Datasource {
  constructor(data) {
    if (!(data instanceof Array)) {
      log.error('Provided data was not an array, failing.');
      throw new Error('Provided data was not an array.');
    }

    if (data.length < 1) {
      log.error('Provided data was an empty array, failing.');
      throw new Error('Provided data was an empty array.');
    }

    super(data);
  }

  getSize() {
    return sizeof(this.data[0]) * this.data.length;
  }
}

module.exports = InMemoryDatasource;
