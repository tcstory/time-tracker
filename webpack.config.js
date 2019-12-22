const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let vendorFiles = [];

if (process.env.NODE_ENV === 'production') {
  vendorFiles=  [
    {from: './node_modules/react/umd/react.production.min.js', to: './vendor/react.js'},
    {from: './node_modules/react-dom/umd/react-dom.production.min.js', to: './vendor/react-dom.js'},
    {from: './node_modules/rxjs/bundles/rxjs.umd.min.js', to: './vendor/rxjs.umd.js'},
  ]
} else {
  vendorFiles =  [
    {from: './node_modules/react/umd/react.development.js', to: './vendor/react.js'},
    {from: './node_modules/react-dom/umd/react-dom.development.js', to: './vendor/react-dom.js'},
    {from: './node_modules/rxjs/bundles/rxjs.umd.js', to: './vendor/rxjs.umd.js'},
  ]
}

let options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    dashboard: path.join(__dirname, "src/dashboard.tsx"),
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'eslint-loader',
        options: {
          emitWarning: true, // 这个配置需要打开，才能在控制台输出warning信息
          emitError: true, // 这个配置需要打开，才能在控制台输出error信息
          fix: false // 是否自动修复，如果是，每次保存时会自动修复可以修复的部分
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
              hmr: false,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[local]__[hash:5]',
                context: path.resolve(__dirname, 'src'),
              }
            }
          },
          {
            loader: 'sass-loader',
          }
        ],
        exclude: [/node_modules/, path.resolve(__dirname, 'src/css/mystyles.scss')]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
              hmr: false,
            },
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          }
        ],
        include: path.resolve(__dirname, 'src/css/mystyles.scss')
      },
      {
        test: new RegExp('\.(' + ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"].join('|') + ')$'),
        loader: "file-loader",
        options: {
          name: '[name].[ext]',
          outputPath: 'assets',
        },
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin([{
      from: "src/manifest.json",
      transform: function (content, path) {
        // generates the manifest file using the package.json informations
        return Buffer.from(JSON.stringify({
          description: process.env.npm_package_description,
          version: process.env.npm_package_version,
          ...JSON.parse(content.toString())
        }));
      }
    }]),
    new CopyWebpackPlugin(vendorFiles),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/dashboard.html"),
      filename: "dashboard.html",
      chunks: ["dashboard"]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css',
    })
  ]
};

if (process.env.NODE_ENV !== "production") {
  // dont use eval style of source map or you will meet the csp problem
  // https://github.com/webpack/webpack/issues/5627
  options.devtool = "cheap-module-source-map";
}

module.exports = options;
