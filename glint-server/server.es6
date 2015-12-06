import koala from 'koala';
import IO from 'koa-socket';
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
  yield app.route(this, function () { });
});

server.server.listen(8080, function(err) {
  if (err) {
    log.error('Could not fire up server: ' , err);
    throw err;
  }

  log.debug('Server listening on port 8080.');
});

socket.use( function *( ctx, next ) {
  log.debug( 'Socket middleware' );
  const start = new Date();
  yield next();
  const ms = new Date - start;
  log.debug( `WS ${ ms }ms` );
});

/**
 * Socket handlers
 */
socket.on( 'connection', ctx => {
  log.debug( 'Join event', ctx.socket.id );
  socket.broadcast( 'connections', {
    numConnections: socket.connections.size
  })
});

socket.on( 'disconnect', ctx => {
  log.debug( 'leave event', ctx.socket.id );
  socket.broadcast( 'connections', {
    numConnections: socket.connections.size
  })
});

socket.on( 'data', ( ctx, data ) => {
  log.debug( 'data event', data );
  log.debug( 'ctx:', ctx.event, ctx.data, ctx.socket.id );
  log.debug( 'ctx.teststring:', ctx.teststring );
  ctx.socket.emit( 'response', {
    message: 'response from server'
  })
});

socket.on( 'numConnections', packet => {
  log.debug( `Number of connections: ${ socket.connections.size }` );
});

export default app
