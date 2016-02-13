//TODO remove when harmony_rest_parameters is enabled by default
require('harmonize')(['harmony_rest_parameters']);

//TODO remove when decorators land in node
require('babel-register');

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

gulp.task('test', () => {
  return gulp.src('./test/unit/**/*.es6')
    .pipe(mocha({
      reporter: 'spec',
      quiet:false,
      colors:true,
      timeout: 10000
    }));
});

gulp.task('default', ['watch']);
