// gulp
const gulp = require('gulp');

// plugins
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');

// utils
const del = require('del');
const runSequence = require('run-sequence');

// testing
const mocha = require('gulp-mocha');

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
      quiet: false,
      colors: true,
      timeout: 10000
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

gulp.task('dist', ['test']);
