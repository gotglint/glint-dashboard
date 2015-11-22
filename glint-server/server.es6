import koala from 'koala';
import {App} from 'horse';

import setupRoutes from './lib/routes.es6';

const server = koala();
const app = new App();
setupRoutes(app);

/**
 * The dirty bloody magic that binds Koa to Horse to our routes
 */
server.use(function *() {
  yield app.route(this, function () { });
});

server.listen(3000);

export default app
