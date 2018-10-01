
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const DashboardPlugin = require('webpack-dashboard/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


let config = {
  entry: [
    path.resolve(__dirname, 'src/js/app.js'),
    path.resolve(__dirname, 'src/sass/app.scss'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-[hash].min.js',
    // publicPath: '/dist'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              presets: ['@babel/preset-env'],
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            query: {
              modules: true,
              importLoaders: 1,
              localIdentName: '[local]' // 輸出後　class 重新命名
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            query: {
              modules: true,
              localIdentName: '[local]'
            }
          },
          // 'postcss-loader'
        ]
      },
    ]
  },
  // resolve: {},
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/',
    port: 8000,
    contentBase: './dist',
  },
  plugins: [
    new CleanWebpackPlugin('dist'),
    new MiniCssExtractPlugin({
      filename: "stylesheets/[name].css"
    }),
    new HtmlWebpackPlugin({
      title: 'Output Management',
      template: 'index.html'
    }),
    // new DashboardPlugin(),
  ]
};

module.exports = config;
