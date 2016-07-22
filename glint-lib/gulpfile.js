// gulp
const gulp = require('gulp');

// plugins
const eslint = require('gulp-eslint');

// testing
const mocha = require('gulp-mocha');

// packaging
const webpack = require('webpack-stream');

// utilities
const del = require('del');
const EventEmitter = require('eventemitter3');
const Primus = require('primus');
const runSequence = require('run-sequence');

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.babel.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
  return gulp.src('./test/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      quiet: false,
      colors: true,
      timeout: 10000
    }));
});

gulp.task('primus', () => {
  const primus = new Primus(new EventEmitter(), {transformer: 'websockets', parser: 'binary'});
  primus.save('src/primus-glint.js');
});

gulp.task('build', ['test'], () => {
  return gulp.src('src/**/*.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', () => {
  return del(['dist/**']);
});


gulp.task('default', (callback) => {
  runSequence('clean', 'build', callback);
});

gulp.task('dist', ['default']);
