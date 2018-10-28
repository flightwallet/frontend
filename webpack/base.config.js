var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry:  [
    path.resolve(__dirname, '../src/index.js') // arguments can be seen as being passed to `cd` and chained from left to right; see https://nodejs.org/api/path.html#path_path_resolve_from_to
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },

  node: {
    fs: "empty",
  },

  output: {
    path: path.resolve(__dirname, '../dist/'),
    publicPath: '/',
    filename: '[name].js',
  },

  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  },

  stats: {
    colors: true
  }
};
