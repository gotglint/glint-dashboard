import getLog from '../../../src/util/log';
const log = getLog();

import {GlintExecutor} from '../../../src/engine/executor';

import * as gl from 'glint-lib';

describe('GlintExecutor', () => {
  // const expect = chai.expect;

  describe('execute', () => {
    it('Executes a script', () => {
      // TODO make this a test first
      const glintClient = new gl.GlintClient()
        .parallelize([0, 1, 2, 3, 4, 5])
        .reduce((sum, el) => {
          log.debug('Reducing: %d - %d', sum, el);
          return sum + el;
        });

      log.debug('Glint client: %j', glintClient);
      log.debug('Glint operations size: %d', glintClient.getOperations().size);

      const glintExecutor = new GlintExecutor();
      const result = glintExecutor.execute([]);
      log.debug('Result: ', result);

      // expect(result).not.to.be.null;
    });
  });
});
