// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv'
import Dotenv from 'dotenv-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import webpack from 'webpack'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import path, { dirname } from 'path'

import { fileURLToPath } from 'url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url)
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = dirname(__filename)

dotenv.config()
export default {
  devServer: {
    port: 3100,
    https: process.env.HTTP === undefined,
    http2: process.env.HTTP === undefined,
    historyApiFallback: true,
    hot: false,
    client: {
      overlay: false,
      progress: true
    }
  },
  cache: { type: 'filesystem' },
  module: {
    noParse: /\.wasm$/,
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      // {
      //   test: /\.js$/,
      //   use: 'babel-loader',
      //   exclude: /node_modules/
      // },
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: { not: [/el/] } // exclude react component if *.svg?el
      },
      {
        test: /\.svg$/i,
        resourceQuery: /el/, // *.svg?el
        use: ['@svgr/webpack']
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(png|jpg|gif|webp)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          // translates CSS into CommonJS
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: { lessOptions: { javascriptEnabled: true } }
          }
        ]
      }
    ]
  },
  entry: { main: ['./src/index.tsx'] },
  devtool: process.env.DEBUG ? 'source-map' : undefined,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    extensions: ['.tsx', '.ts', '.js'],
    // preferRelative: true,
    fallback: {
      // crypto: require.resolve('crypto-browserify'),
      //   stream: require.resolve('stream-browserify'),
      //   assert: require.resolve('assert'),
      //   http: require.resolve('stream-http'),
      //   https: require.resolve('https-browserify'),
      //   os: require.resolve('os-browserify'),
      //   url: require.resolve('url'),
      //   constants: require.resolve('constants-browserify'),
      //   zlib: require.resolve('browserify-zlib'),
      //   querystring: require.resolve('querystring-es3')

      // net: require.resolve('net-browserify'),
      async_hooks: false,

      fs: false,
      path: require.resolve('path-browserify'),
      net: false,
      // crypto: false,
      os: require.resolve('os-browserify/browser'),
      util: require.resolve('util/')
      // assert: false,
      // stream: false,
      // events: false,
      // constants: false
    }
  },
  mode: 'production',
  optimization: { splitChunks: { chunks: 'all' } },

  plugins: [
    new NodePolyfillPlugin(),
    new Dotenv({
      allowEmptyValues: true,
      systemvars: true
    }),

    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: 'index.html',
      favicon: 'assets/favicon.webp',
      template: 'assets/index.html',
      environment: process.env.NODE_ENV,
      hash: true
    }),
    new webpack.ProvidePlugin({ process: 'process/browser' }),
    process.env.SIZE_ANALYSIS === 'true' ? new BundleAnalyzerPlugin({ }) : null
  ].filter(i => i)
}
