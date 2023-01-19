var path = require('path');
const webpack = require('webpack');
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = {
    entry: ['./dist/index.js'],
    output: {
        filename: 'sui-social-wallet.js'
    },
    optimization: {
        minimizer: [
            new ESBuildMinifyPlugin({
                keepNames: true,
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.m?js/,
                exclude: /node_modules/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    }
};