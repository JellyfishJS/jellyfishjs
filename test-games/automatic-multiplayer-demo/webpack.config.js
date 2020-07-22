const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: path.join(__dirname, "/dist"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    mode: process.env.NODE_ENV || "development",
    devtool: "cheap-eval-source-map",
    plugins: [
        new Dotenv(),
    ],
}
