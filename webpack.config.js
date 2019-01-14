const path = require("path");
const uglifyjs = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  mode: "development", //打包为开发模式
  //入口文件的配置项
  entry: "./index.html",
  //出口文件的配置项
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].js'
  },
  //模块：例如解读CSS,图片如何转换，压缩
  module: {
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  //插件，用于生产模版和各项功能
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        removeAttributeQuotes: true
      },
      hash: true,
      template: './index.html'
    }),
    new uglifyjs(), //压缩js
  ],
  //配置webpack开发服务功能
  devServer: {}
}