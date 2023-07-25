const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common');
const { AddCode } = require('./webpack.addCode');
const { PluginGetFileSize } = require('./webpack.fileSize');

const options = merge(common, {
    mode: 'production',
    plugins: [],
    module: {
        rules: [],
    },
});

const { ENV } = process.env;

const genHtml = ENV === 'preview';

if (genHtml) {
    options.plugins.push(
        new HtmlWebpackPlugin({
            template: 'dist/template.html',
            filename: 'index.html',
        }),
        new CopyPlugin({
            patterns: [{ from: 'public', to: '' }],
        })
    );
} else {
    options.plugins.push(new AddCode(), new PluginGetFileSize('trilium-chat.js'));
}

module.exports = options;
