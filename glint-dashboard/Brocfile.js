var sassDir = 'src/scss';
var scriptDir = 'src/app';

var env = process.env.BROCCOLI_ENV || 'development';

var BrowserSync = require('broccoli-browser-sync');
var Funnel = require('broccoli-funnel');

var eslint = require('broccoli-lint-eslint');
var esTranspiler = require('broccoli-babel-transpiler');

var mergeTrees = require('broccoli-merge-trees');
var sass = require('broccoli-sass');
var stew = require('broccoli-stew');

var styles = sass([sassDir], 'app.scss', 'css/app.css');

var lintedScripts = eslint(scriptDir, {
  extensions: ['.es6', '.js']
});
var scriptTree = esTranspiler(lintedScripts, {
  filterExtensions:['js', 'es6']
});
var renamedScripts = stew.rename(scriptTree, '.es6', '.js');
var movedScripts = new Funnel(renamedScripts, {
  destDir: 'js'
});

var staticFiles = new Funnel('src', {include: ['config.js', '*.html', '*.png', '*.gif', '*.jpg', '*.ico']});

if (env === 'production') {
  // do minification/babel/...
}

if (env === 'test') {
  // run tests
}

var sync = new BrowserSync([staticFiles, styles]);

var jspm = new Funnel('jspm_packages', {
  destDir: 'jspm_packages'
});

module.exports = mergeTrees([staticFiles, styles, movedScripts, sync, jspm]);
