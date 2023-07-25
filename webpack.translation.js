const { Compilation, sources } = require('webpack');
const translationMap = require('./webpack.translation.json');

class Translation {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('Translation', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'Translation',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                (assets) => {
                    Object.entries(assets).forEach(([pathname, source]) => {
                        if (/trilium-chat/.test(pathname)) {
                            let souceCode = source.source();
                            const reg = /i{(.+)}/;
                            let match;
                            // eslint-disable-next-line no-cond-assign
                            while ((match = reg.exec(souceCode)) !== null) {
                                const key = match[1];
                                // eslint-disable-next-line no-await-in-loop
                                souceCode = souceCode.replace(match[0], translationMap[key]);
                            }
                            compilation.updateAsset(pathname, new sources.RawSource(souceCode));
                        }
                    });
                }
            );
        });
    }
}

module.exports = { Translation };
