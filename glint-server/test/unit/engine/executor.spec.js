import getLog from '../../log';
const log = getLog();

import {GlintExecutor} from '../../../src/engine/executor';

import {GlintClient} from 'glint-lib';

describe('GlintExecutor', () => {
  let expect = chai.expect;

  describe('execute', () => {
    it('Executes a script', () => {
      // TODO make this a test first
      const glintClient = new GlintClient();
      glintClient.parallelize([0, 1, 2, 3, 4, 5])
        .reduce((sum, el) => {
          log.debug('Reducing: %d - %d', sum, el);
          return sum + el;
        });
      /*.run((result) => {
          log.debug('All done - result: %d', result);
        });*/

      const glintExecutor = new GlintExecutor();
      const result = glintExecutor.execute(glintClient.getOperations());

      expect(result).not.to.be.null;
    });
  });
});
