const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// console.log('+++ env:', process.env.NODE_ENV);
module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'build'),
    clean: true,
    filename: 'static/[name].[contenthash].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[contenthash].[ext]',
        },
      },
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 开启 babel 缓存
          cacheDirectory: true,
          // 关闭缓存压缩
          cacheCompression: false,
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  devtool: 'source-map',
  devServer: {
    host: 'localhost',
    open: true,
    hot: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target:
          // 'http://10.101.96.28:8082/api/apimock-v2/d78a52c482b9a8890a7f87bd7d6f5d08',
          'http://10.200.48.72:30000',
      },
    ],
  },
};
