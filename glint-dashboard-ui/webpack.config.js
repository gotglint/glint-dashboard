const webpack = require('webpack');

const AureliaWebpackPlugin = require('aurelia-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

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

module.exports = {
  context: __dirname,
  entry: {
    'app': [/* this is filled by the aurelia-webpack-plugin */],
    'aurelia-bootstrap': coreBundles.bootstrap,
    'aurelia': coreBundles.aurelia.filter(pkg => coreBundles.bootstrap.indexOf(pkg) === -1)
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'main-[hash].js', // no hash in main.js because index.html is a static page
  },
  module: {
    loaders: [
      { test: /\.html$/,   loader: 'html' },
      { test: /\.js$/,     loader: 'babel', exclude: /(node_modules|bower_components)/, query: { presets: ['es2015'], plugins: ['transform-decorators-legacy', 'transform-runtime'] } },
      { test: /\.json$/,   loader: 'json-loader' },
      { test: /\.woff$/,   loader: 'url-loader?prefix=font/&limit=5000' },
      { test: /\.eot$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.ttf$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.svg$/,    loader: 'file-loader?prefix=font/' },
      { test: require.resolve('jquery'), loader: 'expose?$!expose?jQuery' }
    ]
  },
  plugins: [
    new AureliaWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: 'body'
    }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery' // this doesn't expose jQuery property for window, but exposes it to every module
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: [
        'aurelia-bootstrap',
        ...Object.keys(this.entry || {}).filter(entry => entry !== 'aurelia-bootstrap' && entry !== 'app')
      ].reverse()
    })
  ],
  devtool: 'source-map'
};
