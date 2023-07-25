const { Compilation, sources } = require('webpack');
const packageJson = require('./package.json');

const versionCode = `window.__triliumChatVersion = '${packageJson.version}';`;

class AddVersion {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('AddVersion', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'AddVersion',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                (/* assets */) => {
                    const file = compilation.getAsset('trilium-chat.js');
                    const finalCode = `${versionCode}\n ${file.source.source()}`;
                    compilation.updateAsset('trilium-chat.js', new sources.RawSource(finalCode));
                }
            );
        });
    }
}

module.exports = { AddVersion };
