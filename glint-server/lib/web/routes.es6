import executor from '../util/executor.es6';

function setupRoutes(app, server) {
  const log = server.context.log;
  log.debug('Configuring routes.');

  app.router.get('/', function *() {
    log.debug('Handling default route.');

    this.body = {test: true};
  });

  app.router.get('/test', function *() {
    log.debug('Handling default route.');

    this.body = {test: true};
  });

  app.router.post('/job', function *() {
    if (!this.request.is('json')) {
      log.warn('Job submission got a non-JSON request, ignoring.');
      return this.throw(415, 'Unexpected request type provided.');
    }

    const body = yield* this.request.json();

    log.debug('Submitting job: ', body);
    this.body = yield* executor(body);

    log.debug('Sending response back.');
  });
}

export default setupRoutes;
