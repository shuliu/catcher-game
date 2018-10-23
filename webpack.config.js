const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const DashboardPlugin = require('webpack-dashboard/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

/**
 * apis json
 */

/**
 * @var {object} getInfoData 起始遊戲資訊
 * 未登入：                    catcher-game-info-status-login.json
 * 登入但不在期間內(超過或未到)： catcher-game-info-status-date.json
 * 登入但超過當日可遊戲人數：     catcher-game-info-status-over.json
 * 登入但本日已玩過：            catcher-game-info-status-play.json
 * 登入且可遊戲： catcher-game-info.json
 * */
const getInfoData = require('./src/json/catcher-game-info-status-default');
const getInfoDataLogin = require('./src/json/catcher-game-info-status-login');
const getInfoDataDate = require('./src/json/catcher-game-info-status-default');
const getInfoDataOver = require('./src/json/catcher-game-info-status-over');
const getInfoDataPlayed = require('./src/json/catcher-game-info-status-played');
/** @var {object} postData 送出得點資訊領點 */
const postData = require('./src/json/catcher-game-post');
const postDataStateusPlayed = require('./src/json/catcher-game-post-status-played');
const TITLE = '神降好運 狂歡接彩球';
const DESC = '11/5-11/12每日一次遊戲機會，於遊戲時間30秒內，移動下方小丑接取落下的彩球，每顆彩球內含神腦紅利點數，接越多賺越多！';
const WEB_URL = 'https://shuliu.github.io/';
const EVENT_URL = `https://shuliu.github.io/catcher/`;

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
        use: [{
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          }
        }]
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
    before(app) {
      // 取得活動資訊 - 不在活動期間
      app.get('/eventsite/Catcher/devKey/getInfo-date', (req, res) => res.send(getInfoDataDate))
      // 取得活動資訊 - 未登入
      app.get('/eventsite/Catcher/devKey/getInfo-login', (req, res) => res.send(getInfoDataLogin))
      // 取得活動資訊 - 超過當日人數
      app.get('/eventsite/Catcher/devKey/getInfo-over', (req, res) => res.send(getInfoDataOver))
      // 取得活動資訊 - 本日已玩過
      app.get('/eventsite/Catcher/devKey/getInfo-play', (req, res) => res.send(getInfoDataPlayed))
      // 取得活動資訊 - 可遊戲
      app.get('/eventsite/Catcher/devKey/getInfo', (req, res) => res.send(getInfoData))
      // 遊戲結束發送遊戲得分
      app.post('/eventsite/Catcher/devKey/post', (req, res) => res.send(postData))
      // 遊戲結束發送遊戲得分 - 已經領過了
      app.post('/eventsite/Catcher/devKey/post-play', (req, res) => res.send(postDataStateusPlayed))
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
      title: TITLE,
      template: 'index.html',
      environment: {
        DESC: DESC,
        WEB_URL: WEB_URL,
        EVENT_URL: EVENT_URL,
      }
    }),
    // new DashboardPlugin(),
  ],
  // mode: 'production'
};

module.exports = config;