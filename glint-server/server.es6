import koala from 'koala';
import {App} from 'horse';

import log from 'intel';

import setupRoutes from './lib/routes.es6';

log.basicConfig({
  format: {
    'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
    'colorize': true
  }
});

const server = koala();
const app = new App();

setupRoutes(app);

server.context.log = log;

/**
 * The dirty bloody magic that binds Koa to Horse to our routes
 */
server.use(function *() {
  yield app.route(this, function () { });
});

server.listen(3000, function(err) {
  if (err) {
    log.error('Could not fire up server: ' , err);
    throw err;
  }

  log.debug('Server listening on port 3000.');
});

export default app
