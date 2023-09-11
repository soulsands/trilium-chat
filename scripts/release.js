const cp = require('child_process');

const { version } = require('../package.json');

try {
    cp.execSync('git add .');
    cp.execSync(`git commit -m "release ${version}"`);
    cp.execSync(`git push`);
} catch (error) {
    console.error(error);
}

const command = `gh release create ${version}  ./release/trilium-chat.js   --title ${version} `;

try {
    const res = cp.execSync(command).toString();
    // eslint-disable-next-line no-console
    console.log(res);
} catch (error) {
    /* empty */
}
