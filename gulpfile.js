var hub = require('gulp-hub');

var projects = {
  dashboard: 'glint-dashboard/gulpfile.js',
  library: 'glint-lib/gulpfile.babel.js',
  server: 'glint-server/gulpfile.babel.js'
};

hub([projects.dashboard, projects.library, projects.server]);
