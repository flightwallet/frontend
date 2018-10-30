const base = require('./base.config');
const merge = require('webpack-merge');

const productionConfig = {
  mode: 'production',
  devtool: 'source-map', // activate source maps, see https://webpack.github.io/docs/configuration.html#devtool alternative cheap-module-eval-source-map: has proper source maps in development
};

module.exports = merge(base, productionConfig);
