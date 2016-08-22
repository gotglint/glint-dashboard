const Ravel = require('ravel');
const Routes = Ravel.Routes;
const mapping = Routes.mapping;

class DashboardRoutes extends Routes {
  constructor() {
    super('/dashboard'); // base path for all routes in this class. Will be prepended to the @mapping.
  }

  // bind this method to an endpoint and verb with @mapping. This one will become GET /app
  @mapping(Routes.GET, 'app')
  appHandler(ctx) {
    ctx.status = 204;
  }
}

// Export Routes class
module.exports = DashboardRoutes;
