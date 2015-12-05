var env = process.env.BROCCOLI_ENV || 'development';

// browsersync
var BrowserSync = require('broccoli-browser-sync-ml');
var proxy = require('http-proxy-middleware');

// underscore
var _ = require('underscore');

// script stuff
var eslint = require('broccoli-lint-eslint');
var babel = require('broccoli-babel-transpiler');

// sass stuff
var sass = require('broccoli-sass');
var bourbon = require('node-bourbon').includePaths;

// broc stuff
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');
var stew = require('broccoli-stew');

// variables
var sassDir = 'src/scss';
var scriptDir = 'src/app';

// styles
var bDir = _(bourbon).first().replace(__dirname, "./");
var styles = sass([sassDir, bDir], 'app.scss', 'css/app.css');

// scripts
var lintedScripts = eslint(scriptDir, {
  extensions: ['.es6', '.js']
});
var scriptTree = babel(lintedScripts, {
  stage: 0,
  optional: [
    "es7.decorators",
    "es7.classProperties"],
  browserPolyfill: true,
  filterExtensions: ['js', 'es6']
});
var renamedScripts = stew.rename(scriptTree, '.es6', '.js');
var movedScripts = new Funnel(renamedScripts, {
  destDir: 'js'
});

// static content
var staticFiles = new Funnel('src', {include: ['config.js', '*.html', '*.png', '*.gif', '*.jpg', '*.ico']});

if (env === 'production') {
  // do minification/babel/...
}

if (env === 'test') {
  // run tests
}

// copy all jspm files in
var jspm = new Funnel('jspm_packages', {
  destDir: 'jspm_packages'
});

// browsersync options
var bsOptions = {
  browserSync: {
    open: false,
    middleware: [
      proxy('/api/**', {
        target: 'http://localhost:8080/',
        pathRewrite: {
          '^/api': ''
        }
      }),
      proxy('/live', {
        target: 'http://localhost:8080/',
        pathRewrite: {
          '^/live': ''
        },
        ws: true})
    ]
  }
};
var sync = new BrowserSync([staticFiles, styles, movedScripts, jspm], bsOptions);

// put it all together
module.exports = mergeTrees([staticFiles, styles, movedScripts, sync, jspm]);
