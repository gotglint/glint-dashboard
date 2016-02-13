module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.es6'
    ],

    tests: [
      'test/unit/**/*.spec.es6'
    ],

    env: {
      type: 'node',
      runner: 'node',
      params: {
        env: 'NODE_ENV=test',
        runner: '--harmony'
      }
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel: require('babel-core'),
        presets: ['es2015', 'stage-0']
      })
    },

    setup: function () {
      require("babel-polyfill");
    },

    debug: true
  };
};
