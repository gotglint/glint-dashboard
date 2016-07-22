const webpack = require('webpack');

module.exports = {
  entry:   './src/index.js',
  output:  {
    filename:       './index.js',
    libraryTarget:  'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      output:   {comments: false}
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty'
  }
};
