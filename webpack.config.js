
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const DashboardPlugin = require('webpack-dashboard/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const webpack = require('webpack');


let config = {
  // entry: {
  //   'javascripts/app.min': path.resolve(__dirname, 'src/js/app.js'),
  //   // 'stylesheets/main.min': path.resolve(__dirname, 'src/sass/main.scss'),
  // },
  entry: [path.resolve(__dirname, 'src/js/app.js'), path.resolve(__dirname, 'src/sass/main.scss')],
  // entry: {
  //   app: path.resolve(__dirname, 'src/js/app.js'),
  //   // path.resolve(__dirname, 'src/sass/main.scss')
  // },
  output: {
    path: path.resolve(__dirname, 'dist/assets'),
    // filename: '[name].min.js',//'[name]-[chunkhash].js'
    // publicPath: '/dist'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].min.js',
              outputPath: 'javascripts/'
            }
          },
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            }
          }
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {loader: "css-loader"},
          {loader: "sass-loader"}
        ]
      }
    ]
  },
  // resolve: {},
  devtool: 'inline-source-map',
  devServer: {
    publicPath: '/',
    port: 8000,
    // contentBase: './dist',
  },
  plugins: [
    new CleanWebpackPlugin('dist'),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: "stylesheets/[name].css"
    })
    // new DashboardPlugin(),
  ]
};

module.exports = config;
