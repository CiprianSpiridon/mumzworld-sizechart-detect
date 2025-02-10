const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { detectSizeChart } = require('./detector');
const { stringify } = require('csv-stringify');

/**
 * Generate a timestamp string in format: YYYYMMDD_HHMMSS
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Process a single SKU folder containing images
 * @param {string} skuPath - Path to the SKU folder
 * @returns {Promise<Object>} Processing results for the SKU
 */
async function processSkuFolder(skuPath) {
    try {
        // Get all files in the SKU folder
        const files = await fsPromises.readdir(skuPath);
        
        // Filter for image files
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (imageFiles.length === 0) {
            console.log(`No images found in SKU folder: ${path.basename(skuPath)}`);
            return {
                sku: path.basename(skuPath),
                'image 1': '',
                'image 2': '',
                'image 3': '',
                'image 1 result': 'ERROR - No images found',
                'image 2 result': 'ERROR - No images found',
                'image 3 result': 'ERROR - No images found'
            };
        }

        // Sort files to ensure consistent order
        imageFiles.sort();

        // Take up to 3 images
        const images = imageFiles.slice(0, 3);
        const results = [];
        const sku = path.basename(skuPath);

        console.log(`\nProcessing SKU: ${sku}`);

        // Process each image
        for (let i = 0; i < 3; i++) {
            const file = images[i];
            const imagePath = file ? path.join(skuPath, file) : '';
            
            if (file) {
                console.log(`├─ Image ${i + 1}: ${file}`);
            }

            try {
                if (imagePath) {
                    // Check if file exists and is accessible
                    try {
                        await fsPromises.access(imagePath);
                        const result = await detectSizeChart(imagePath);
                        console.log(`   ├─ Image ${i + 1} Result: ${result.answer} (Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
                        results.push(result.answer);
                    } catch (error) {
                        console.error(`Error accessing file ${file}:`, error.message);
                        results.push('ERROR - File not accessible');
                    }
                } else {
                    results.push('ERROR - No image');
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                results.push('ERROR - Processing failed');
            }
        }

        return {
            sku,
            'image 1': images[0] ? path.resolve(skuPath, images[0]) : '',
            'image 2': images[1] ? path.resolve(skuPath, images[1]) : '',
            'image 3': images[2] ? path.resolve(skuPath, images[2]) : '',
            'image 1 result': results[0] || 'ERROR - Missing',
            'image 2 result': results[1] || 'ERROR - Missing',
            'image 3 result': results[2] || 'ERROR - Missing'
        };
    } catch (error) {
        console.error(`Error processing SKU folder ${path.basename(skuPath)}:`, error.message);
        return {
            sku: path.basename(skuPath),
            'image 1': '',
            'image 2': '',
            'image 3': '',
            'image 1 result': 'ERROR - Folder processing failed',
            'image 2 result': 'ERROR - Folder processing failed',
            'image 3 result': 'ERROR - Folder processing failed'
        };
    }
}

/**
 * Process the main folder containing SKU folders
 * @param {string} mainFolderPath - Path to the main folder
 */
async function processMainFolder(mainFolderPath) {
    try {
        // Check if main folder exists
        const stats = await fsPromises.stat(mainFolderPath);
        if (!stats.isDirectory()) {
            console.error(`${mainFolderPath} is not a directory`);
            return;
        }

        // Get all SKU folders
        const skuFolders = await fsPromises.readdir(mainFolderPath);
        
        if (skuFolders.length === 0) {
            console.log('No SKU folders found');
            return;
        }

        // Create results directory if it doesn't exist
        const resultsDir = path.join(process.cwd(), 'results');
        await fsPromises.mkdir(resultsDir, { recursive: true });

        // Generate output filename with timestamp
        const timestamp = getTimestamp();
        const mainFolderName = path.basename(mainFolderPath);
        const outputPath = path.join(resultsDir, `${timestamp}_${mainFolderName}-processed.csv`);

        console.log(`Processing folder: ${mainFolderPath}`);
        console.log(`Results will be saved to: ${outputPath}`);

        let processedCount = 0;
        let errorCount = 0;
        const startTime = Date.now();
        const results = [];

        // Process each SKU folder
        for (const skuFolder of skuFolders) {
            const skuPath = path.join(mainFolderPath, skuFolder);
            
            // Check if it's a directory
            const skuStats = await fsPromises.stat(skuPath);
            if (skuStats.isDirectory()) {
                const result = await processSkuFolder(skuPath);
                if (result) {
                    results.push(result);
                    processedCount++;
                    if (result['image 1 result'].startsWith('ERROR') ||
                        result['image 2 result'].startsWith('ERROR') ||
                        result['image 3 result'].startsWith('ERROR')) {
                        errorCount++;
                    }
                } else {
                    errorCount++;
                }

                // Show progress
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                const rate = processedCount / elapsedSeconds || 0;
                console.log(`\nProgress: ${processedCount}/${skuFolders.length} SKUs (${(processedCount/skuFolders.length*100).toFixed(1)}%)`);
                console.log(`Speed: ${rate.toFixed(2)} SKUs/sec - Errors: ${errorCount}`);
            }
        }

        // Write results to CSV
        return new Promise((resolve, reject) => {
            const stringifier = stringify({
                header: true,
                columns: {
                    'sku': 'sku',
                    'image 1': 'image 1',
                    'image 2': 'image 2',
                    'image 3': 'image 3',
                    'image 1 result': 'image 1 result',
                    'image 2 result': 'image 2 result',
                    'image 3 result': 'image 3 result'
                }
            });

            const writeStream = fs.createWriteStream(outputPath);
            
            writeStream.on('finish', () => {
                // Print summary
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                const rate = processedCount / elapsedSeconds || 0;
                
                console.log('\n=== Processing Summary ===');
                console.log(`Total SKUs processed: ${processedCount}`);
                console.log(`Processing rate: ${rate.toFixed(2)} SKUs/sec`);
                console.log(`Errors encountered: ${errorCount}`);
                console.log(`Time taken: ${elapsedSeconds} seconds`);
                console.log(`Results saved to: ${outputPath}`);
                
                resolve();
            });

            writeStream.on('error', (error) => {
                console.error('Error writing CSV:', error);
                reject(error);
            });

            // Transform results to match CSV processor format
            const finalResults = results.map(row => ({
                'sku': row.sku,
                'image 1': row['image 1'],
                'image 2': row['image 2'],
                'image 3': row['image 3'],
                'image 1 result': row['image 1 result'],
                'image 2 result': row['image 2 result'],
                'image 3 result': row['image 3 result']
            }));

            stringifier.pipe(writeStream);
            finalResults.forEach(row => stringifier.write(row));
            stringifier.end();
        });

    } catch (error) {
        console.error('Error processing main folder:', error.message);
        throw error;
    }
}

module.exports = {
    processSkuFolder,
    processMainFolder
}; 