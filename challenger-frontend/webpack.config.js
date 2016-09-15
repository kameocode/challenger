var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },

  plugins: [
    new webpack.ProvidePlugin({
      "React": "react",
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [{
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src'),
        exclude: /(node_modules|bower_components)/,
      },


      { test: /\.tsx?$/,
        loaders: ['react-hot', 'babel', 'ts-loader' ],


        include: path.join(__dirname, 'src'),
        exclude: /(node_modules|bower_components)/,
        preLoaders: [
          // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
          { test: /\.js$/, loader: "source-map-loader" }
        ]
      }
    ]
  }
};


//npm install --save-dev html-loader
//npm install material-ui