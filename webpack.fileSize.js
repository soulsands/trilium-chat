const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

class PluginGetFileSize {
    constructor(file) {
        // receive file to get size
        this.file = file;
    }

    apply(compiler) {
        const { ENV } = process.env;
        const map = {
            triliumTest: 'Test',
            prod: 'Prod',
        };
        const fileName = map[ENV];

        if (!fileName) return;

        compiler.hooks.done.tap('Get File Size', (stats) => {
            // Get output file
            const file = stats.compilation.assetsInfo.get(this.file);

            // Verify if file exists
            if (!file) return console.log('File not exists');

            // Get file size
            const fileSizeInBytes = file.size;

            // only used to convert
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

            // Get size type
            const sizeType = parseInt(Math.floor(Math.log(fileSizeInBytes) / Math.log(1024)).toString(), 10);

            // Get size of file using size type
            const size = Math.round(fileSizeInBytes / 1024 ** sizeType);

            const logItem = `${packageJson.version} | ${new Date().toLocaleString()} | ${size} ${
                sizes[sizeType]
            } | ${fileSizeInBytes}\n`;

            const logFile = path.join(__dirname, `./logs/fileSize${fileName}.log`);
            fs.appendFileSync(logFile, logItem);
        });
    }
}
module.exports = { PluginGetFileSize };
