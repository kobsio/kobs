/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable sort-keys */
const path = require('path');
const { merge } = require('webpack-merge');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common('production'), {
  mode: 'production',

  devtool: 'source-map',

  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
  },

  // plugins: [
  //   new MiniCssExtractPlugin({
  //     filename: '[name].css',
  //     chunkFilename: '[name].bundle.css',
  //   }),
  // ],

  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       include: [
  //         path.resolve(__dirname, 'src'),
  //         path.resolve(__dirname, 'node_modules/patternfly'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/patternfly'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/react-styles/css'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/styles/base.css'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css'),
  //         path.resolve(__dirname, 'node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css'),
  //         path.resolve(
  //           __dirname,
  //           'node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css',
  //         ),
  //       ],
  //       use: [MiniCssExtractPlugin.loader, 'css-loader'],
  //     },
  //   ],
  // },

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
        ],
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
});
