// polyfill madness
require('babel-polyfill');

// gulp
import gulp from 'gulp';

// plugins
import eslint from 'gulp-eslint';

// testing
import mocha from 'gulp-mocha';

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

gulp.task('watch', ['test'], () => {
  gulp.watch('src/**/*.js', ['test']);
});

gulp.task('default', ['build']);

gulp.task('dist', ['test']);
