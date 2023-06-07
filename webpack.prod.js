const { merge } = require('webpack-merge');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common');
const { AddCode } = require('./webpack.addCode');
const { PluginGetFileSize } = require('./webpack.fileSize');

let SkeletonCode = '';
try {
    const skeletonReg = /<!-- skeleton-flag -->([\s\S]*)<!-- skeleton-flag -->/;
    const skeletonPath = path.join(__dirname, './dist/template.html');
    const skeletonFileCode = fs.readFileSync(skeletonPath, 'utf8');

    SkeletonCode = `
    /* skeleton-flag */
   const skeleton = \`${skeletonFileCode.match(skeletonReg)[1].trim()}\`;
    /* skeleton-flag */
    `;
} catch (error) {
    console.error('skeleton template extracting fail');
    console.error(error);
}

const options = merge(common, {
    mode: 'production',
    plugins: [],
    module: {
        rules: [
            SkeletonCode && {
                test: /ViewTrilium\.js$/,
                loader: 'string-replace-loader',
                options: {
                    search: /\/\*\sskeleton-flag\s\*\/[\s\S]*\/\*\sskeleton-flag\s\*\//,
                    replace: SkeletonCode,
                },
            },
        ],
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
