'use strict';

const easyWebpack = require('@easy-webpack/core');
const generateConfig = easyWebpack.default;
const path = require('path');
let config;

// basic configuration:
const rootDir = path.resolve();
const srcDir = path.resolve('src');
const outDir = path.resolve('dist');

const coreBundles = {
  bootstrap: [
    'aurelia-bootstrapper-webpack',
    'aurelia-polyfills',
    'aurelia-pal',
    'aurelia-pal-browser',
    'regenerator-runtime',
    'bluebird'
  ],
  aurelia: [
    'aurelia-bootstrapper-webpack',
    'aurelia-binding',
    'aurelia-dependency-injection',
    'aurelia-event-aggregator',
    'aurelia-framework',
    'aurelia-history',
    'aurelia-history-browser',
    'aurelia-loader',
    'aurelia-loader-webpack',
    'aurelia-logging',
    'aurelia-logging-console',
    'aurelia-metadata',
    'aurelia-pal',
    'aurelia-pal-browser',
    'aurelia-path',
    'aurelia-polyfills',
    'aurelia-route-recognizer',
    'aurelia-router',
    'aurelia-task-queue',
    'aurelia-templating',
    'aurelia-templating-binding',
    'aurelia-templating-router',
    'aurelia-templating-resources'
  ]
};

const baseConfig = {
  entry: {
    'app': [],
    'aurelia-bootstrap': coreBundles.bootstrap,
    'aurelia': coreBundles.aurelia.filter(pkg => coreBundles.bootstrap.indexOf(pkg) === -1)
  },
  output: {
    path: outDir,
  },
  module: {
    loaders: [
      { test: /\.scss$/,   loader: 'ignore-loader' }
    ]
  }
};

process.env.NODE_ENV = 'development';
config = generateConfig(
  baseConfig,

  require('@easy-webpack/config-env-development')(),

  require('@easy-webpack/config-aurelia')
  ({root: rootDir, src: srcDir}),

  require('@easy-webpack/config-babel')(),
  require('@easy-webpack/config-html')({exclude: './src/index.html'}),

  require('@easy-webpack/config-css')
  ({ filename: 'bundle.css', allChunks: true, sourceMap: false }),

  require('@easy-webpack/config-fonts-and-images')(),
  require('@easy-webpack/config-global-bluebird')(),
  require('@easy-webpack/config-global-jquery')(),
  require('@easy-webpack/config-global-regenerator')(),
  require('@easy-webpack/config-generate-index-html')
  ({minify: false, overrideOptions: {template: './src/index.html'}}),

  require('@easy-webpack/config-copy-files')
  ({patterns: [{ from: './src/favicon.ico', to: 'favicon.ico' }]}),

  require('@easy-webpack/config-common-chunks-simple')
  ({appChunkName: 'app', firstChunk: 'aurelia-bootstrap'})
);

module.exports = config;
