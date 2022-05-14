/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-undef */
/* eslint-disable sort-keys */
const path = require('path');
const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = merge(common('development'), {
  mode: 'development',

  devtool: 'eval-source-map',

  devServer: {
    port: 3000,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:15220',
    },
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
          path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
          path.resolve(
            __dirname,
            'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css',
          ),
          path.resolve(__dirname, 'node_modules/xterm/css'),
        ],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
