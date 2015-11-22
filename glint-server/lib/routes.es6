function setupRoutes(app) {
  app.router.get('/', function *() {
    this.body = {test: true};
  });
}

export default setupRoutes;
