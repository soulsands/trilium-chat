const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
    devServer: {
        hot: true,
        port: 8081,
        watchFiles: ['./src/template.html'],
        client: {
            overlay: {
                errors: false,
                warnings: false,
                runtimeErrors: true,
            },
        },
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'trilium-chat',
            template: 'src/template.html',
        }),
    ],
});
