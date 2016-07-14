const log = require('../util/log');

const koa = require('koa');
const co = require('co');
const IO = require('koa-socket');

const App = require('horse');

const setupRoutes = require('./routes');

const REPL = require('../util/repl');

const koaApp = koa();
require('koa-csrf')(koaApp);
require('koa-body-parsers')(koaApp);
require('koa-qs')(koaApp);
koaApp.querystring = require('qs');

koaApp.use(require('koa-response-time')());
koaApp.use(require('koa-logger')());

const app = new App();
const socket = new IO();
socket.attach(koaApp);

// set stuff into the context for children to access
koaApp.context.log = log;

// init the routes/dependencies
setupRoutes(app, koaApp);

/**
 * The dirty bloody magic that binds Koa to Horse to our routes
 */
koaApp.use(function *() {
  yield app.route(this, function () {
  });
});

koaApp.server.listen(8080, function (err) {
  if (err) {
    log.error('Could not fire up koa: ', err);
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

module.exports = app;
