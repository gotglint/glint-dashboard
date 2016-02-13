const gulp = require('gulp');

// plugins
const nodemon = require('gulp-nodemon');

// testing
const mocha = require('gulp-mocha');

gulp.task('watch', () => {
  nodemon({
    script: __dirname + '/index.js',
    cwd:    __dirname,
    ext:    'js html',
    env:    {'NODE_ENV': 'development'}
  });
});

gulp.task('default', ['watch']);
