/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2022-03-13 09:26:49
 */
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: !isProd && 'eval-cheap-source-map',
  entry: {
    app: path.resolve(__dirname, './index.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../website-dist'),
    filename: isProd ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
    publicPath: '/',
  },
  resolve: {
    // 配置解析规则
    extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, '../website'),
    },
  },
  module: {
    rules: [
      // vue
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // mjs
      {
        test: /\.mjs$/,
        resolve: {
          byDependency: {
            esm: { fullySpecified: false },
          },
        },
        include: [/node_modules/],
      },
      // js jsx
      {
        test: /\.js(x)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      // ts tsx
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              appendTsxSuffixTo: [/\.vue$/],
            },
          },
        ],
        exclude: /node_modules/,
      },
      // md
      {
        test: /\.md$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false,
              },
            },
          },
          {
            loader: path.resolve(__dirname, './md-loader/index.js'),
          },
        ],
      },
      // css
      {
        test: /\.css?$/,
        use: [isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader'],
      },
      // scss
      {
        test: /\.scss?$/,
        use: [isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader', 'sass-loader'],
      },
      // do not base64-inline SVG
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // images
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // fonts
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'fonts/[contenthash:8][ext][query]' },
      },
      // media
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'media/[contenthash:8][ext][query]' },
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  devServer: {
    /* 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html */
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [{ from: /.*/, to: '/index.html' }],
    },
    client: {
      overlay: false,
      progress: true,
    },
    host: 'localhost',
    port: '8082',
    hot: true, // 热加载
    open: true,
    proxy: {},
  },
  plugins: (isProd
    ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].css',
        }),
      ]
    : []
  ).concat([
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './website/index.html',
      favicon: './website/favicon.ico',
      inject: true,
    }),
  ]),
};
