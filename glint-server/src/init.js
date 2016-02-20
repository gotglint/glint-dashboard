import 'colors';
import fs from 'fs';
import program from 'commander';

import master from './master';
import slave from './slave';

import getLog from './util/log';
const log = getLog();

const meta = JSON.parse(fs.readFileSync('./package.json'));

program
  .version(meta.version);

program
  .option('-m, --master <master>', 'Override the IP/port that the master will listen on; defaults to tcp://*:5671.', 'tcp://*:5671')
  .option('-s, --slave <master>', 'Run as a slave; provide the IP/port of the master node (mandatory).');

program.on('--help', function(){
  console.log('  By default, this application will fire up a master instance.');
  console.log('');
});

program.parse(process.argv);

if (program.slave) {
  var slaveOptions = {
    masterHost: program.slave
  };

  log.info('Initializing slave, connecting to: %s', program.slave);
  slave(slaveOptions);
} else {
  var masterOptions = {
    masterHost: program.master
  };

  log.info('Initializing new master [ binding to %s ]', program.master);
  master(masterOptions);
}

