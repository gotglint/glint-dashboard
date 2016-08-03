// gulp
const gulp = require('gulp');

// plugins
const eslint = require('gulp-eslint');

// testing
const mocha = require('gulp-mocha');

// utilities
const del = require('del');
const runSequence = require('run-sequence');
const webpack = require('webpack-stream');

gulp.task('clean', () => {
  return del(['dist/**']);
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
  return gulp.src('./test/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      quiet:    false,
      colors:   true,
      timeout:  10000
    }));
});

gulp.task('build', ['test'], () => {
  return gulp.src('src/app/app.js')
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', (callback) => {
  runSequence('clean', 'build', callback);
});

gulp.task('dist', ['default']);
