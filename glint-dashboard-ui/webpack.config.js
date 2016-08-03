const AureliaWebpackPlugin = require('aurelia-webpack-plugin');
const path = require('path');

module.exports = {
  context: __dirname,
  entry: './src/app/app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'assets/', // relative path for github pages
    filename: 'main-[hash].js', // no hash in main.js because index.html is a static page
  },
  module: {
    loaders: [
      { test: /\.js$/,     loader: 'babel', exclude: /(node_modules|bower_components)/, query: { presets: ['es2015'] } },
      { test: /\.json$/,   loader: 'json-loader' },
      { test: /\.woff$/,   loader: 'url-loader?prefix=font/&limit=5000' },
      { test: /\.eot$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.ttf$/,    loader: 'file-loader?prefix=font/' },
      { test: /\.svg$/,    loader: 'file-loader?prefix=font/' },
    ]
  },
  plugins: [new AureliaWebpackPlugin()],
  devtool: 'source-map'
};
