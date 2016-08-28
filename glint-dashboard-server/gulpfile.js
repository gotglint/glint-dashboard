// gulp
const gulp = require('gulp');

// plugins
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');

// testing
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

// utils
const del = require('del');
const isparta = require('isparta');
const runSequence = require('run-sequence');
const spawn = require('child_process').spawn;

gulp.task('clean', () => {
  return del(['dist/**', 'coverage/**']);
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('coverage', ['lint'], () => {
  return gulp.src(['src/**/*.js'])
    .pipe(istanbul({
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire());
});


gulp.task('test:coverage', ['lint', 'coverage'], () => {
  return gulp.src('test/unit/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      quiet:    false,
      colors:   true,
      timeout:  10000
    }))
    .pipe(istanbul.writeReports({
      reporters: ['lcov']
    }));
});

gulp.task('test', ['lint', 'coverage'], () => {
  return gulp.src('./test/unit/**/*.js')
    .pipe(mocha({
      reporter: 'spec',
      quiet:    false,
      colors:   true,
      timeout:  10000
    }))
    .pipe(istanbul.writeReports({
      reporters: ['text-summary']
    }));
});
gulp.task('build', ['lint'], () => {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

// BEGIN watch stuff
let server;
gulp.task('serve', ['build'], function() {
  if (server) {
    server.kill();
  }

  server = spawn('node', ['--debug', 'app.js'], {
    stdio: 'inherit',
    cwd: 'dist',
    env: process.env
  });

  server.on('close', function (code) {
    if (code > 0) {
      console.error('Error detected, waiting for changes...');
    }
  });
});

process.on('exit', () => {
  if (server) {
    server.kill();
  }
});

gulp.task('watch', ['lint', 'serve'], () => {
  gulp.watch('src/**/*.js', {interval: 1000, mode: 'poll'}, ['lint', 'serve']);
  gulp.watch('.ravelrc', {interval: 1000, mode: 'poll'}, ['serve']);
});
// END watch stuff

gulp.task('default', (callback) => {
  runSequence('clean', 'build', callback);
});

gulp.task('ci', (callback) => {
  runSequence('clean', 'build', 'test:coverage', callback);
});

gulp.task('dist', ['test']);
