const { processMainFolder } = require('./lib/folderProcessor');
const { detectSizeChart } = require('./lib/detector');

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.log('Usage: node index.js <main_folder_path>');
        process.exit(1);
    }

    const mainFolderPath = args[0];
    processMainFolder(mainFolderPath);
}

module.exports = {
    detectSizeChart,
    processMainFolder
};