const { Compilation, sources } = require('webpack');
const packageJson = require('./package.json');

// const optionCode = `window.__triliumChatOptions = {
//     apiKey: 'your key',
//     defaultOptions: {
//         model: 'gpt-3.5-turbo',
//         max_tokens: 250,
//         temperature: 0.3,
//         top_p: 1,
//         presence_penalty: 0.5,
//         frequency_penalty: 0.5,
//         stream: true,
//         n: 1,
//     },
// };
// `;

const versionCode = `window.__triliumChatVersion = '${packageJson.version}';`;

class AddCode {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('AddCode', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'AddCode',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                (/* assets */) => {
                    const file = compilation.getAsset('trilium-chat.js');
                    const finalCode = `${versionCode}\n ${file.source.source()}`;
                    compilation.updateAsset('trilium-chat.js', new sources.RawSource(finalCode));
                }
            );

            // compilation.hooks.afterOptimizeAssets.tap(
            //     {
            //         name: 'AddCode',
            //         stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
            //     },
            //     (assets) => {
            //         const file = compilation.getAsset('main.js');

            //         console.log(file.source.size());

            //         const finalCode = `${optionCode}\n ${file.source.source()}`;
            //         compilation.updateAsset('main.js', new sources.RawSource(finalCode));
            //     }
            // );
        });
    }
}

module.exports = { AddCode };
