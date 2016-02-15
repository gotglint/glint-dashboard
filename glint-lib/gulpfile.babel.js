// gulp
import gulp from 'gulp';

// plugins
import babel from 'gulp-babel';
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

gulp.task('build', ['test'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['test', 'build'], () => {
  gulp.watch('src/**/*.js', ['test', 'build']);
});

gulp.task('default', ['test', 'build']);

gulp.task('dist', ['test', 'build']);
