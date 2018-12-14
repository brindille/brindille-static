const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer-stylus')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'
const WebpackBar = require('webpackbar')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const mode = process.env.NODE_ENV
const isProd = mode === 'production'
const baseFolder = process.env.BRINDILLE_BASE_FOLDER

module.exports = {
  mode,
  context: __dirname,
  entry: {
    build: isProd ? './src/index.js' : ['./src/index.js', hotMiddlewareScript]
  },
  output: {
    path: isProd
      ? path.resolve(__dirname, 'dist' + baseFolder.replace(/\/$/, ''))
      : path.resolve(__dirname, baseFolder.replace(/\/$/, '')),
    publicPath: '/',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      lib: path.resolve(__dirname, 'src/lib'),
      views: path.resolve(__dirname, 'src/views')
    }
  },
  module: {
    rules: [
      { 
        test: /\.styl$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
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
      DEVELOPMENT: !isProd,
      BASEFOLDER: JSON.stringify(baseFolder)
    }),
    new CopyWebpackPlugin([
      {from: 'src/assets', to: './assets'}
    ])
  ],
}

if (isProd) {
  module.exports.optimization = {
    minimizer: [
      new TerserPlugin({
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
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