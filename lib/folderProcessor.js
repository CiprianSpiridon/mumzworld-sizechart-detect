const fs = require('fs').promises;
const path = require('path');
const { detectSizeChart } = require('./detector');

/**
 * Process a single SKU folder containing images
 * @param {string} skuPath - Path to the SKU folder
 */
async function processSkuFolder(skuPath) {
    try {
        // Get all files in the SKU folder
        const files = await fs.readdir(skuPath);
        
        // Filter for image files
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (imageFiles.length === 0) {
            console.log(`No images found in SKU folder: ${path.basename(skuPath)}`);
            return;
        }

        // Process each image
        for (const file of imageFiles) {
            const imagePath = path.join(skuPath, file);
            console.log(`\nAnalyzing ${path.basename(skuPath)}/${file}...`);
            
            try {
                const result = await detectSizeChart(imagePath);
                
                // Print the clear answer first
                console.log(`ANSWER: ${result.answer}`);
                
                // Print confidence details
                console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
                if (result.details) {
                    console.log('Details:');
                    console.log(`  - Line confidence: ${(result.details.lineConfidence * 100).toFixed(1)}%`);
                    console.log(`  - Keyword confidence: ${(result.details.keywordConfidence * 100).toFixed(1)}%`);
                    console.log(`  - Found ${result.details.horizontalLines} horizontal and ${result.details.verticalLines} vertical lines`);
                    console.log(`  - Found ${result.details.keywordMatches} size-related keywords`);
                    if (result.details.detectedText.length > 0) {
                        console.log('  - Sample text:', result.details.detectedText.join(', '));
                    }
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
            }
        }
    } catch (error) {
        console.error(`Error processing SKU folder ${path.basename(skuPath)}:`, error.message);
    }
}

/**
 * Process the main folder containing SKU folders
 * @param {string} mainFolderPath - Path to the main folder
 */
async function processMainFolder(mainFolderPath) {
    try {
        // Check if main folder exists
        const stats = await fs.stat(mainFolderPath);
        if (!stats.isDirectory()) {
            console.error(`${mainFolderPath} is not a directory`);
            return;
        }

        // Get all SKU folders
        const skuFolders = await fs.readdir(mainFolderPath);
        
        if (skuFolders.length === 0) {
            console.log('No SKU folders found');
            return;
        }

        // Process each SKU folder
        for (const skuFolder of skuFolders) {
            const skuPath = path.join(mainFolderPath, skuFolder);
            
            // Check if it's a directory
            const skuStats = await fs.stat(skuPath);
            if (skuStats.isDirectory()) {
                console.log(`\nProcessing SKU: ${skuFolder}`);
                await processSkuFolder(skuPath);
            }
        }
    } catch (error) {
        console.error('Error processing main folder:', error.message);
    }
}

module.exports = {
    processSkuFolder,
    processMainFolder
}; 