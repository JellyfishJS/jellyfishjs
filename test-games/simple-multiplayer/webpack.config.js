const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.join(__dirname, "/dist"),
    },
    mode: process.env.NODE_ENV || "development",
    devtool: "cheap-eval-source-map",
}
