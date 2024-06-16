const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    devtool: argv.mode === 'production' ? false : 'inline-source-map',

    entry: {
        ui: './src/ui.tsx',
        code: './src/code.ts',
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.svg/,
                type: 'asset/inline',
            },
        ],
    },

    resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js']},

    output: {
        filename: (pathData) => {
            return pathData.chunk.name === 'code'
                ? 'code.js'
                : '[name].[contenthash].js';
        },
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    plugins: [
        new webpack.DefinePlugin({
            global: {},
        }),
        new HtmlWebpackPlugin({
            inject: 'body',
            template: './src/ui.html',
            filename: 'ui.html',
            chunks: ['ui'],
        }),
        new HtmlInlineScriptPlugin({
            htmlMatchPattern: [/ui.html/],
            scriptMatchPattern: [/.js$/],
        }),
    ],
});