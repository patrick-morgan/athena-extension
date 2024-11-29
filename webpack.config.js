const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.tsx",
    contentScript: "./src/scripts/contentScript.js",
    background: "./src/scripts/background.js",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("tailwindcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      // Combined reCAPTCHA and Google APIs removal rules
      {
        test: /\.(js|ts|tsx)$/,
        enforce: "pre",
        use: [
          {
            loader: "string-replace-loader",
            options: {
              multiple: [
                // reCAPTCHA replacements
                { search: /recaptcha/gi, replace: "excluded", flags: "g" },
                {
                  search: /getRecaptcha/g,
                  replace: "(() => undefined)",
                  flags: "g",
                },
                {
                  search: /loadRecaptcha/g,
                  replace: "(() => undefined)",
                  flags: "g",
                },
                {
                  search: /initRecaptcha/g,
                  replace: "(() => undefined)",
                  flags: "g",
                },
                {
                  search: /require\(['"]\.\/recaptcha['"]\)/g,
                  replace: "({})",
                  flags: "g",
                },
                {
                  search: /import.*recaptcha.*from/g,
                  replace: "import empty from",
                  flags: "g",
                },

                // Google APIs replacements
                {
                  search: /https:\/\/apis\.google\.com\/js\/api\.js/g,
                  replace: "",
                  flags: "g",
                },
                {
                  search: /gapi\.load/g,
                  replace: "(() => undefined)",
                  flags: "g",
                },
                {
                  search: /gapi\.client\.init/g,
                  replace: "(() => Promise.resolve())",
                  flags: "g",
                },
                {
                  search: /gapi\.auth/g,
                  replace: "(() => undefined)",
                  flags: "g",
                },
                { search: /gapi\.client/g, replace: "{}", flags: "g" },
                {
                  search: /require\(['"]googleapis['"]\)/g,
                  replace: "({})",
                  flags: "g",
                },
                {
                  search: /import.*googleapis.*from/g,
                  replace: "import empty from",
                  flags: "g",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            pure_funcs: [
              // reCAPTCHA functions
              "_loadRecaptcha",
              "_loadRecaptchaScript",
              "loadRecaptcha",
              "initRecaptcha",
              "getRecaptcha",
              "_getRecaptcha",
              "_initRecaptcha",
              // Google API functions
              "loadGoogleAPI",
              "initGoogleAPI",
              "gapiLoad",
              "gapiInit",
            ],
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    // Combined IgnorePlugin for reCAPTCHA and Google APIs
    new webpack.IgnorePlugin({
      resourceRegExp: /recaptcha|\/auth\/index\.js$|googleapis|gapi/,
      contextRegExp: /firebase|@firebase|google-api/,
    }),
    new Dotenv({
      path: "./.env",
      safe: true,
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new CopyPlugin({
      patterns: [
        { from: "public", to: "../" },
        { from: "manifest.json", to: "../manifest.json" },
      ],
    }),
    ...getHtmlPlugins(["index"]),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Combined aliases
      "./recaptcha": path.resolve(__dirname, "src/empty.js"),
      "firebase/recaptcha": path.resolve(__dirname, "src/empty.js"),
      "@firebase/recaptcha": path.resolve(__dirname, "src/empty.js"),
      recaptcha: path.resolve(__dirname, "src/empty.js"),
      googleapis: path.resolve(__dirname, "src/empty.js"),
      "google-api": path.resolve(__dirname, "src/empty.js"),
    },
    fallback: {
      recaptcha: false,
      googleapis: false,
      "google-api": false,
    },
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
  },
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HTMLPlugin({
        title: "Athena extension",
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  );
}
