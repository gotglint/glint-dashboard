var hub = require('gulp-hub');

var projects = {
  dashboard: 'glint-dashboard/gulpfile.js',
  library: 'glint-lib/gulpfile.js',
  server: 'glint-server/gulpfile.js'
};

hub([projects.dashboard, projects.library, projects.server]);
