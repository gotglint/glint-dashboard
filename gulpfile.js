const hub = require('gulp-hub');

const projects = {
  server: 'glint-dashboard-server/gulpfile.js',
  ui: 'glint-dashboard-ui/gulpfile.js'
};

hub([projects.server, projects.ui]);
