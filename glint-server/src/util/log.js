const intel = require('intel');

let configured = false;

function getLog() {
  if (configured === false) {
    intel.basicConfig({
      format: {
        'format': '[%(date)s] %(name)s.%(levelname)s: %(message)s',
        'colorize': true
      }
    });

    configured = true;
  }

  return intel;
}

module.exports.getLog = getLog;
