const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './public/empty.js',
    output: {
        filename: 'template.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    mode: 'production',
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/template.html',
            filename: 'template.html',
            minify: {
                collapseWhitespace: true,
                keepClosingSlash: true,
                removeComments: false,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
            },
        }),
    ],
};
