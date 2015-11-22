import log from 'intel';
import util from 'util';
import vm from 'vm';

function* executor(script) {
  log.debug('Executing: ', script.job);

  try {
    const sandbox = {};
    const context = new vm.createContext(sandbox);
    const scriptProc = new vm.Script(script.job);

    scriptProc.runInContext(context);
    log.debug('Executor output: ', util.inspect(sandbox));
    return {result:sandbox};
  } catch (ex) {
    log.error('Could not execute script: ', ex);
    return ex;
  }
}

export default executor;
