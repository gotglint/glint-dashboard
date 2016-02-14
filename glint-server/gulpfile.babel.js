// gulp
import gulp from 'gulp';

// plugins
import nodemon from 'gulp-nodemon';

// testing
import mocha from 'gulp-mocha';

gulp.task('test', () => {
  return gulp.src('./test/unit/**/*.js')
    .pipe(mocha({
      reporter:  'spec',
      quiet:     false,
      colors:    true,
      timeout:   10000
    }));
});

gulp.task('watch', () => {
  nodemon({
    script: __dirname + '/index.js',
    cwd:    __dirname,
    ext:    'js html',
    env:    {'NODE_ENV': 'development'}
  });
});

gulp.task('default', ['watch']);
