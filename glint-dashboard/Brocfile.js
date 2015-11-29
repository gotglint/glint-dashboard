var env = process.env.BROCCOLI_ENV || 'development';

var BrowserSync = require('broccoli-browser-sync');
var Funnel = require('broccoli-funnel');

var eslint = require('broccoli-lint-eslint');
var babel = require('broccoli-babel-transpiler');

var mergeTrees = require('broccoli-merge-trees');
var sass = require('broccoli-sass');
var stew = require('broccoli-stew');

// variables
var sassDir = 'src/scss';
var scriptDir = 'src/app';

// styles
var styles = sass([sassDir], 'app.scss', 'css/app.css');

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
  filterExtensions:['js', 'es6']
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

// browser sync
var sync = new BrowserSync([staticFiles, styles, movedScripts, jspm]);

// put it all together
module.exports = mergeTrees([staticFiles, styles, movedScripts, sync, jspm]);
