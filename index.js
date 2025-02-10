const { processMainFolder } = require('./lib/folderProcessor');
const { detectSizeChart } = require('./lib/detector');
const { processCSV } = require('./lib/csvProcessor');
const path = require('path');

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--csv')) {
        if (args.length !== 2) {
            console.log('Usage: node index.js --csv <input_csv_path>');
            process.exit(1);
        }
        
        const inputPath = args[1];
        // Generate output path by adding '-processed' before the extension
        const parsedPath = path.parse(inputPath);
        const outputPath = path.join(
            parsedPath.dir,
            `${parsedPath.name}-processed${parsedPath.ext}`
        );
        
        console.log(`Processing CSV file: ${inputPath}`);
        console.log(`Output will be saved to: ${outputPath}`);
        
        processCSV(inputPath, outputPath)
            .then(() => {
                console.log('CSV processing completed successfully');
            })
            .catch((error) => {
                console.error('Error processing CSV:', error);
                process.exit(1);
            });
    } else {
        if (args.length !== 1) {
            console.log('Usage: node index.js <main_folder_path>');
            console.log('   or: node index.js --csv <input_csv_path>');
            process.exit(1);
        }

        const mainFolderPath = args[0];
        processMainFolder(mainFolderPath);
    }
}

module.exports = {
    detectSizeChart,
    processMainFolder,
    processCSV
};