// gulp
const gulp = require('gulp');

// plugins
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const minifyCss = require('gulp-minify-css');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

// testing
const mocha = require('gulp-mocha');

// utilities
const del = require('del');
const runSequence = require('run-sequence');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

// proxy middleware
const proxy = require('http-proxy-middleware');

// variables
const paths = {
  js: ['./src/**/*.js'],
  html: ['./src/**/*.html'],
  sass: ['./src/scss/**/*.scss']
};

gulp.task('clean:webpack', () => {
  return del(['dist/js/*.js', 'dist/js/*.js.map', 'dist/index.html', 'dist/*.ico', 'dist/*.svg']);
});

gulp.task('clean', () => {
  return del(['dist/**']);
});

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build:sass', (done) => {
  gulp.src('./src/scss/app.scss')
    .pipe(sass({includePaths: require('node-bourbon').includePaths}))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist/css/'))
    .on('end', done);
});

gulp.task('build:js', ['clean:webpack'], () => {
  return gulp.src('src/app/app.js')
    .pipe(webpackStream(require('./webpack.config.js'), webpack))
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['lint'], (callback) => {
  runSequence('build:sass', 'build:js', callback);
});

gulp.task('server', () => {
  connect.server({
    root: ['dist'],
    port: 9000,
    livereload: true,
    middleware: () => {
      return [
        proxy('/primus', {
          target: 'http://localhost:9080',
          changeOrigin: true,
          ws: true
        })
      ];
    }
  });
});

gulp.task('watch', ['build', 'server'], () => {
  gulp.watch(paths.sass, ['build:sass']);
  gulp.watch(paths.js, ['build:js']);
  gulp.watch(paths.html, ['build:js']);
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

gulp.task('default', (callback) => {
  runSequence('clean', 'build', callback);
});

gulp.task('dist', ['default']);
