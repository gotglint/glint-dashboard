// gulp
const gulp = require('gulp');

// plugins
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');

// testing
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

// utils
const del = require('del');
const isparta = require('isparta');
const runSequence = require('run-sequence');

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

gulp.task('server', ['build'], () => {
  nodemon({
    cwd: 'dist',
    script: 'app.js',
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  });
});

gulp.task('watch', ['test', 'server'], () => {
  gulp.watch('src/**/*.js', ['build']);
});

gulp.task('default', (callback) => {
  runSequence('clean', 'build', callback);
});

gulp.task('ci', (callback) => {
  runSequence('clean', 'build', 'test:coverage', callback);
});

gulp.task('dist', ['test']);
