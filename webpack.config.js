const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer-stylus')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: process.env.NODE_ENV,
  context: __dirname,
  entry: {
    build: process.env.NODE_ENV === 'production' ? './src/index.js' : ['./src/index.js', hotMiddlewareScript]
  },
  output: {
    path: process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, 'dist' + process.env.BRINDILLE_BASE_FOLDER.replace(/\/$/, ''))
      : path.resolve(__dirname, process.env.BRINDILLE_BASE_FOLDER.replace(/\/$/, '')),
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
  module: {
    rules: [
      { 
        test: /\.styl$/,
        use: [
          process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader'
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
    new webpack.DefinePlugin({
      DEVELOPMENT: process.env.NODE_ENV !== 'production',
      'process.env': {
        'BRINDILLE_BASE_FOLDER': JSON.stringify(process.env.BRINDILLE_BASE_FOLDER)
      }
    }),
    new CopyWebpackPlugin([
      {from: 'src/assets', to: './assets'}
    ])
  ],
}

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new WebpackBar()
  )
} else {
  module.exports.devtool = '#source-map'
  module.exports.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  )
}