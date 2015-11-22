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

// set stuff into the context for children to access
server.context.log = log;

// init the routes/dependencies
setupRoutes(app, server);

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
