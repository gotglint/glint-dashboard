const webpack = require('webpack');
const path = require('path');

const AureliaWebpackPlugin = require('aurelia-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    app: './src/app/main.js',
    bootstrap: ["aurelia-bootstrapper-webpack", "aurelia-polyfills", "aurelia-pal", "aurelia-pal-browser", "regenerator-runtime", "bluebird"],
    aurelia: ["aurelia-binding", "aurelia-dependency-injection", "aurelia-event-aggregator", "aurelia-framework", "aurelia-history", "aurelia-history-browser", "aurelia-loader", "aurelia-loader-webpack", "aurelia-logging", "aurelia-logging-console", "aurelia-metadata", "aurelia-path", "aurelia-route-recognizer", "aurelia-router", "aurelia-task-queue", "aurelia-templating", "aurelia-templating-binding", "aurelia-templating-router", "aurelia-templating-resources"]
  },
  output: {
    path: "./dist",
    filename: "js/[name].bundle.js",
    sourceMapFilename: "js/[name].bundle.map",
    chunkFilename: "js/[id].chunk.js"
  },
  debug: true,
  devtool: "cheap-module-inline-source-map",
  module: {
    loaders: [
      { test: /\.html$/,   loader: 'html' },
      { test: /\.js$/,     loader: 'babel', exclude: /(node_modules|bower_components)/, query: { presets: ['es2015'], plugins: ['transform-decorators-legacy', 'transform-runtime'] } },
      { test: /\.json$/,   loader: 'json-loader' },
      { test: /\.woff$/,   loader: 'url-loader?prefix=font/&limit=5000' },
      { test: /\.eot$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.ttf$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.svg$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.ico/,     loader: 'file-loader' },
      { test: /\.css$/,    loader: 'ignore-loader' },
      { test: /\.scss$/,   loader: 'ignore-loader' },
      { test: require.resolve('jquery'), loader: 'expose?$!expose?jQuery' }
    ]
  },
  plugins: [
    new AureliaWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      chunksSortMode: 'dependency'
      }),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery',
      'Promise': 'bluebird',
      'regeneratorRuntime': 'regenerator-runtime'
    })
  ]
};
