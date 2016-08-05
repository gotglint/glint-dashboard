const Ravel = require('ravel');
const app = new Ravel();

app.set('log level', app.log.DEBUG);
app.set('redis host', 'localhost');
app.set('redis port', 6379);
app.set('keygrip keys', ['mysecret']);
app.set('port', '9080');

app.modules('./modules'); //import all Modules from a directory
// app.resources('./resources');  //import all Resources from a directory
app.routes('./routes/index.js');  //import all Routes from a file

// start it up!
app.start();
