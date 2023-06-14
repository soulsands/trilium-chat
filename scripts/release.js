const cp = require('child_process');

const { version } = require('../package.json');

cp.execSync('git add');
cp.execSync(`git commit -m "release ${version}"`);
cp.execSync(`git push`);

const command = `gh release create ${version}  ./release/trilium-chat.js   --title ${version} `;

try {
    const res = cp.execSync(command).toString();
    // eslint-disable-next-line no-console
    console.log(res);
} catch (error) {
    /* empty */
}
