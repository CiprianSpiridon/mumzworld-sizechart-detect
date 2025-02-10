const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const { Transform } = require('stream');
const { detectSizeChart } = require('./detector');
const { cleanupTempFiles } = require('./imageDownloader');
const axios = require('axios');
const path = require('path');

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
 * Convert Google Sheets URL to CSV export URL
 * @param {string} url - Input URL
 * @returns {string} CSV export URL
 */
function convertGoogleSheetUrl(url) {
    // Check if it's a Google Sheets URL
    if (url.includes('docs.google.com/spreadsheets')) {
        // Extract the document ID
        let docId = '';
        if (url.includes('/d/')) {
            docId = url.split('/d/')[1].split('/')[0];
        } else if (url.includes('key=')) {
            docId = url.split('key=')[1].split('&')[0];
        }
        
        if (docId) {
            // Convert to CSV export URL
            return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
        }
    }
    return url;
}

/**
 * Download CSV file from URL
 * @param {string} url - URL of the CSV file
 * @returns {Promise<string>} - Content of the CSV file
 */
async function downloadCSV(url) {
    try {
        // Convert Google Sheets URL if necessary
        const csvUrl = convertGoogleSheetUrl(url);
        
        const response = await axios({
            url: csvUrl,
            responseType: 'text',
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to download CSV: ${error.message}`);
    }
}

/**
 * Format a URL for display by truncating if too long
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
function formatUrl(url) {
    if (!url) return 'empty';
    if (url.length > 50) {
        return url.substring(0, 47) + '...';
    }
    return url;
}

/**
 * Process CSV file and add detection results
 * @param {string} input - Path or URL to input CSV file
 * @param {string} outputPath - Path to output CSV file
 * @returns {Promise<void>}
 */
async function processCSV(input, outputPath) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create results directory if it doesn't exist
            const resultsDir = path.join(process.cwd(), 'results');
            await fs.promises.mkdir(resultsDir, { recursive: true });

            // Generate output path with timestamp
            const timestamp = getTimestamp();
            const inputName = path.basename(input, path.extname(input));
            const finalOutputPath = path.join(resultsDir, `${timestamp}_${inputName}-processed.csv`);

            console.log(`Processing CSV file: ${input}`);
            console.log(`Results will be saved to: ${finalOutputPath}`);

            let csvContent;
            const isUrl = input.startsWith('http://') || input.startsWith('https://');

            if (isUrl) {
                console.log('Downloading CSV file...');
                csvContent = await downloadCSV(input);
                // Create a readable stream from the CSV content
                const readStream = require('stream').Readable.from([csvContent]);
                processCSVStream(readStream, finalOutputPath, resolve, reject);
            } else {
                // Create read stream for local CSV file
                const readStream = fs.createReadStream(input);
                processCSVStream(readStream, finalOutputPath, resolve, reject);
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Process a CSV stream
 * @param {ReadableStream} readStream - Input CSV stream
 * @param {string} outputPath - Path to output CSV file
 * @param {Function} resolve - Promise resolve function
 * @param {Function} reject - Promise reject function
 */
function processCSVStream(readStream, outputPath, resolve, reject) {
    // Create write stream for output CSV
    const writeStream = fs.createWriteStream(outputPath);

    let rowCount = 0;
    let processedCount = 0;
    let errorCount = 0;
    let startTime = Date.now();

    // CSV parser
    const parser = parse({
        skip_empty_lines: true,
        columns: true
    });

    // CSV stringifier
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

    // Helper function to process a single image
    async function processImage(imageUrl, index, tempFiles) {
        if (!imageUrl) return 'ERROR - No image';
        
        let tempFile = null;
        try {
            const result = await detectSizeChart(imageUrl, tempFiles);
            console.log(`   ├─ Image ${index} Result: ${result.answer} (Confidence: ${(result.confidence * 100).toFixed(1)}%)`);
            return result.answer;
        } catch (error) {
            console.log(`   ├─ Image ${index} Error: ${error.message}`);
            if (error.message === 'Not a valid image file') {
                return 'ERROR - Not a valid image';
            }
            return 'ERROR - ' + error.message;
        }
    }

    // Helper function to safely cleanup temp files
    async function cleanupTempFilesForSku(tempFiles) {
        for (const file of tempFiles) {
            try {
                await file.cleanup();
            } catch (error) {
                // Only log if it's not a "file not found" error
                if (error.code !== 'ENOENT') {
                    console.error(`Failed to clean up temp file: ${error.message}`);
                }
            }
        }
    }

    // Transform stream to process each row
    const transformer = new Transform({
        objectMode: true,
        async transform(row, encoding, callback) {
            try {
                rowCount++;
                const processedRow = {
                    'sku': row.sku,
                    'image 1': row['image 1'],
                    'image 2': row['image 2'],
                    'image 3': row['image 3'],
                    'image 1 result': '',
                    'image 2 result': '',
                    'image 3 result': ''
                };

                console.log(`\nProcessing row ${rowCount} - SKU: ${row.sku}`);
                console.log(`├─ Image 1: ${formatUrl(row['image 1'])}`);
                console.log(`├─ Image 2: ${formatUrl(row['image 2'])}`);
                console.log(`└─ Image 3: ${formatUrl(row['image 3'])}`);

                // Track temporary files for this SKU
                const tempFiles = [];

                try {
                    // Process images in parallel but with error handling for each
                    const results = await Promise.all([
                        processImage(row['image 1'], 1, tempFiles),
                        processImage(row['image 2'], 2, tempFiles),
                        processImage(row['image 3'], 3, tempFiles)
                    ]);

                    // Add results
                    processedRow['image 1 result'] = results[0];
                    processedRow['image 2 result'] = results[1];
                    processedRow['image 3 result'] = results[2];

                    // Count errors
                    if (results.some(r => r && r.startsWith('ERROR'))) {
                        errorCount++;
                    }
                } catch (error) {
                    console.error(`Error processing SKU ${row.sku}:`, error);
                    processedRow['image 1 result'] = 'ERROR - Processing failed';
                    processedRow['image 2 result'] = 'ERROR - Processing failed';
                    processedRow['image 3 result'] = 'ERROR - Processing failed';
                    errorCount++;
                } finally {
                    // Clean up all temporary files for this SKU
                    await cleanupTempFilesForSku(tempFiles);
                }

                processedCount++;
                const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
                const rate = processedCount / elapsedSeconds || 0;
                
                if (processedCount % 10 === 0) {
                    console.log(`\nProgress: ${processedCount}/${rowCount} rows (${(processedCount/rowCount*100).toFixed(1)}%)`);
                    console.log(`Speed: ${rate.toFixed(2)} rows/sec - Errors: ${errorCount}`);
                }

                callback(null, processedRow);
            } catch (error) {
                console.error(`Fatal error processing row for SKU ${row.sku}:`, error);
                errorCount++;
                callback(null, {
                    'sku': row.sku,
                    'image 1': row['image 1'],
                    'image 2': row['image 2'],
                    'image 3': row['image 3'],
                    'image 1 result': 'ERROR - Fatal error',
                    'image 2 result': 'ERROR - Fatal error',
                    'image 3 result': 'ERROR - Fatal error'
                });
            }
        }
    });

    // Set up pipeline with error handling
    const pipeline = readStream
        .pipe(parser)
        .pipe(transformer)
        .pipe(stringifier)
        .pipe(writeStream);

    pipeline.on('error', (error) => {
        console.error('Pipeline error:', error);
        reject(error);
    });

    // Handle events
    writeStream.on('finish', async () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const rate = processedCount / elapsedSeconds || 0;
        
        console.log('\n=== Processing Summary ===');
        console.log(`Total rows processed: ${processedCount}`);
        console.log(`Processing rate: ${rate.toFixed(2)} rows/sec`);
        console.log(`Errors encountered: ${errorCount}`);
        console.log(`Time taken: ${elapsedSeconds} seconds`);
        
        // Cleanup temp files
        await cleanupTempFiles();
        
        resolve();
    });

    readStream.on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
    });
}

module.exports = {
    processCSV
}; 