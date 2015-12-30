var gulp = require('gulp');

// plugins
var nodemon = require('gulp-nodemon');

gulp.task('watch', function () {
  nodemon({
    script: __dirname + '/index.js',
    cwd: __dirname,
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('default', ['watch']);
