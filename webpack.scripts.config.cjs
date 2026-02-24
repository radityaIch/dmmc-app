const path = require("path");
const fs = require("fs");

const BOOKMARKLETS_INPUT_DIR = "./bookmarklets-src";
const SCRIPTS_OUTPUT_DIR = "./public/scripts";

const scriptEntryPoints = {};
if (fs.existsSync(BOOKMARKLETS_INPUT_DIR)) {
  fs.readdirSync(BOOKMARKLETS_INPUT_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
    .forEach((f) => {
      scriptEntryPoints[path.basename(f, path.extname(f))] = "./" + path.join(BOOKMARKLETS_INPUT_DIR, f);
    });
}

module.exports = (env) => ({
  mode: env && env.development ? "development" : "production",
  entry: {
    "all-in-one": "./utils/all-in-one.ts",
    ...scriptEntryPoints,
  },
  output: {
    path: path.resolve(__dirname, SCRIPTS_OUTPUT_DIR),
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
});
