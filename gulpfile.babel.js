var hub = require('gulp-hub');

// dashboard: 'glint-dashboard/gulpfile.js',
var projects = {
  library: 'glint-lib/gulpfile.babel.js',
  server: 'glint-server/gulpfile.babel.js'
};

hub([projects.dashboard, projects.library, projects.server]);
