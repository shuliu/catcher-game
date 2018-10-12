
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const DashboardPlugin = require('webpack-dashboard/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

/**
 * apis json
 */

/** @var {object} getInfoData 起始遊戲資訊 */
const getInfoData = require('./src/json/catcher-game-info');
/** @var {object} postData 送出得點資訊領點 */
const postData = require('./src/json/catcher-game-post');

let config = {
  entry: [
    "@babel/polyfill",
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
  devtool: 'source-map',
  devServer: {
    publicPath: '/',
    port: 8000,
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    clientLogLevel: 'none',
    setup(app){
      app.get('/eventsite/Catcher/201810/getInfo', (req, res) => res.send(getInfoData) )
      app.post('/eventsite/Catcher/201810/post', (req, res) => res.send(postData) )
    },
  },
  plugins: [
    new CleanWebpackPlugin(['dist/main-*.js', 'dist/*.js.map'], {
      root: __dirname,
      verbose: true,
    }),
    new MiniCssExtractPlugin({
      filename: "stylesheets/[name].css"
    }),
    new HtmlWebpackPlugin({
      title: 'Output Management',
      template: 'index.html'
    }),
    // new DashboardPlugin(),
  ],
  // mode: 'production'
};

module.exports = config;
