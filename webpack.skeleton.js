const { Compilation, sources } = require('webpack');
const fs = require('fs');
const path = require('path');

const { ENV } = process.env;
const isDev = ENV === 'dev';

class Skeleton {
    apply(compiler) {
        compiler.hooks.thisCompilation.tap('Skeleton', (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: 'Skeleton',
                    stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
                },
                (assets) => {
                    let SkeletonCode = '';
                    try {
                        const skeletonReg = /<!-- skeleton-flag -->([\s\S]*)<!-- skeleton-flag -->/;
                        const skeletonPath = path.join(__dirname, `./${isDev ? 'src' : 'dist'}/template.html`);
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

                    if (!SkeletonCode) {
                        throw new Error('skeleton miss');
                    }

                    // 根据配置获取文件
                    const files = compilation.getAssets();
                    // could be trilium-chat.[fullhash].js
                    files.forEach((file) => {
                        if (/trilium-chat/.test(file.name)) {
                            const finalCode = file.source
                                .source()
                                .replace(/\/\*\sskeleton-flag\s\*\/[\s\S]*\/\*\sskeleton-flag\s\*\//, SkeletonCode);
                            compilation.updateAsset(file.name, new sources.RawSource(finalCode));
                        }
                    });
                }
            );
        });
    }
}

module.exports = { Skeleton };
