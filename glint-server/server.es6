import koala from 'koala';
import co from 'co';
import IO from 'koa-socket';

import {App} from 'horse';

import log from 'intel';

import setupRoutes from './lib/routes.es6';

import {REPL} from './lib/repl.es6';

log.basicConfig({
  format: {
    'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
    'colorize': true
  }
});

const server = koala();
const app = new App();
const socket = new IO();
socket.attach(server);

// set stuff into the context for children to access
server.context.log = log;

// init the routes/dependencies
setupRoutes(app, server);

/**
 * The dirty bloody magic that binds Koa to Horse to our routes
 */
server.use(function *() {
  yield app.route(this, function () {
  });
});

server.server.listen(8080, function (err) {
  if (err) {
    log.error('Could not fire up server: ', err);
    throw err;
  }

  log.debug('Server listening on port 8080.');
});

socket.use(co.wrap(function *(ctx, next) {
  log.debug('Socket middleware');
  const start = new Date();
  yield next();
  const ms = new Date - start;
  log.debug(`WS ${ ms }ms`);
}));

/**
 * Socket handlers
 */
socket.on('connection', ctx => {
  log.debug('WS connection initiated: ', ctx.socket.id);
});

socket.on('repl', (ctx, data) => {
  log.debug('REPL message received: ', data);
  if (data && data === 'init') {
    let message = {
      runtime: REPL.getRuntimeInfo()
    };

    log.debug('Sending REPL response: ', message);
    ctx.socket.emit('repl', message);
  }
});

export default app
