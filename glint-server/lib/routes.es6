function setupRoutes(app) {
  app.router.get('/', function *() {
    this.app.context.log.debug('Handling default route.');

    this.body = {test: true};
  });
}

export default setupRoutes;
