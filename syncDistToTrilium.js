/* 
use the function "open note externally" then copy the temporary file path and paste it with quote behind the command: yarn build:test

example on windows:   yarn buld:test 'C:\Users\***\AppData\Local\Temp\tmp-29816-wzQ9MJ9Dm6f3-runFrontendStartup  (dup)'

*/

const path = require('path');
const fs = require('fs');

const tempFilePath = process.argv[2];
if (tempFilePath) {
    const distFile = fs.readFileSync(path.join(__dirname, 'dist/trilium-chat.js'), 'utf8');
    fs.writeFileSync(tempFilePath, distFile);
}
