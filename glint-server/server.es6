import koala from 'koala';
import {App} from 'horse';

import setupRoutes from './lib/routes.es6';

const server = koala();
const app = new App();
setupRoutes(app);

server.use(function *() {
  yield app.route(this, function () { });
});

server.listen(3000);

export default app
