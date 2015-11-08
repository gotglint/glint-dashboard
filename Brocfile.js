var sassDir = 'app/scss';
var scriptDir = 'app/js';

var BrowserSync = require('broccoli-browser-sync');
var Funnel = require('broccoli-funnel');

var eslint = require('broccoli-lint-eslint');
var env = require('broccoli-env').getEnv();
var mergeTrees = require('broccoli-merge-trees');
var sass = require('broccoli-sass');
var stew = require('broccoli-stew');
var pickFiles = require('broccoli-static-compiler');

var styles = sass([sassDir], 'app.scss', 'css/app.css');

var lintedScripts = eslint(scriptDir, {});
var renamedScripts = stew.rename(lintedScripts, '.jsx', '.js');
var movedScripts = new Funnel(renamedScripts, {
  destDir: 'js'
});

var staticFiles = new Funnel('app', {include: ['config.js', '*.html', '*.png', '*.gif', '*.jpg', '*.ico']});

if (env === 'production') {
  // do minification/babel/...
}

var sync = new BrowserSync([staticFiles, styles]);

var jspm = new Funnel('jspm_packages', {
  destDir: 'jspm_packages'
});

module.exports = mergeTrees([staticFiles, styles, movedScripts, sync, jspm]);
