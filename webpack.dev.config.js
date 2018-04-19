const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer-stylus')
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    build: ['./src/index.js', hotMiddlewareScript]
  },
  output: {
    path: __dirname,
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
          'style-loader',
          'css-loader',
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
  devtool: '#source-map',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
}
