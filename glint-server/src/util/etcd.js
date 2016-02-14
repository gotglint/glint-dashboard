import UEtcd from 'node-etcd';

import bluebird from 'bluebird';

import getLog from './log';
const log = getLog();

class Etcd {
  constructor(host, port) {
    log.debug('Instantiating node-etcd with: %s:%s', host, port);
    this._inst = new UEtcd(host, port);
    bluebird.promisifyAll(this._inst);
  }

  async set(key, value, ttl) {
    if (ttl) {
      await this._inst.setAsync(key, value, {ttl: ttl});
    } else {
      await this._inst.setAsync(key, value);
    }
  }

  async get(key) {
    let blobKey = await this._inst.getAsync(key);
    console.log(blobKey);
    return blobKey.node.value;
  }
}

export { Etcd };
