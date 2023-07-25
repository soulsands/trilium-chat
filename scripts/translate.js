const glob = require('glob');
const fs = require('fs');

const config = {};
// 配置文件范围
const filePatterns = [
    // 'src/**/*.js', // 匹配src目录下所有子目录中的js文件
    'src/**/*.html', // 匹配src目录下所有子目录中的js文件
];

// 根据配置获取文件路径列表
const filePaths = filePatterns.reduce((acc, pattern) => {
    const files = glob.sync(pattern);
    return [...acc, ...files];
}, []);

// 根据文件路径读取文件内容
filePaths.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    // console.log(content);

    const reg = /i{(.+)}/gi;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = reg.exec(content)) !== null) {
        const key = match[1];
        console.log(key);
        // eslint-disable-next-line no-await-in-loop
        // souceCode = souceCode.replace(match[0], translationMap[key]);
    }
    // console.log(`File: ${filePath}`);
    // console.log(`Content: ${content}`);
});
