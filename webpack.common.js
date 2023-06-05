const path = require('path');
const Dotenv = require('dotenv-webpack');

const { ENV } = process.env;
console.log(ENV);

const envPath = `./.env.${ENV}`;

const OUTPATH_MAP = {
    dev: 'dist',
    triliumTest: 'dist',
    example: 'docs',
    prod: 'release',
};

let outputName = 'main.js';

if (ENV === 'example') {
    outputName = 'main.[fullhash].js';
}

const outPath = OUTPATH_MAP[ENV];

module.exports = {
    entry: './src/main.js',
    output: {
        filename: outputName,
        path: path.resolve(__dirname, outPath),
        clean: true,
    },
    plugins: [
        new Dotenv({
            path: envPath, // Path to .env file (this is the default)
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.less$/i,
                use: [
                    // compiles Less to CSS
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ],
            },
        ],
    },
};
