const hub = require('gulp-hub');

// dashboard: 'glint-dashboard/gulpfile.js',
const projects = {
  library: 'glint-lib/gulpfile.js',
  server: 'glint-server/gulpfile.js'
};

hub([projects.dashboard, projects.library, projects.server]);
