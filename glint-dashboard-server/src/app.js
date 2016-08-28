const Ravel = require('ravel');
const app = new Ravel();

app.set('log level', app.log.DEBUG);

app.modules('./modules'); //import all Modules from a directory
// app.resources('./resources');  //import all Resources from a directory
app.routes('./routes/index.js');  //import all Routes from a file

// start it up!
app.start();
