import intel from 'intel';

let configured = false;

export default function() {
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
};
