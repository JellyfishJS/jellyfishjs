const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.join(__dirname, "/dist"),
    },
    externals: {
        "socket.io": "commonjs socket.io",
    },
    mode: process.env.NODE_ENV || "development",
    devtool: "cheap-eval-source-map",
}
