// require("harmonize")();

// gulp
import gulp from 'gulp';

// plugins
import eslint from 'gulp-eslint';
import nodemon from 'gulp-nodemon';

// testing
import mocha from 'gulp-mocha';


gulp.task('lint', () => {
  return gulp.src(['./src/**/*.js', './test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', ['lint'], () => {
  return gulp.src('./test/unit/**/*.js')
    .pipe(mocha({
      reporter: 'html',
      quiet: false,
      colors: true,
      timeout: 10000
    }));
});

gulp.task('watch', () => {
  nodemon({
    script: __dirname + '/index.js',
    cwd: __dirname,
    ext: 'js html',
    env: {'NODE_ENV': 'development'}
  });
});

gulp.task('default', ['watch']);
