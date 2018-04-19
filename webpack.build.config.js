const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer-stylus')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: {
    build: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, 'src/lib'),
      views: path.resolve(__dirname, 'src/views'),
      Router: path.resolve(__dirname, 'src/Router')
    }
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin()
    ]
  },
  module: {
    rules: [
      { 
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          {
            loader: 'stylus-loader',
            options: {
              use: [autoprefixer()]
            }
          }
        ]
      },
      {
        test: /\.yaml$/,
        loader: 'yaml-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new WebpackBar()
  ],
}
