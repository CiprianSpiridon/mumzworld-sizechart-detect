const config = require('../config');
const imageProcessor = require('./imageProcessor');
const textAnalyzer = require('./textAnalyzer');
const { downloadImageToTemp } = require('./imageDownloader');

/**
 * Calculate line-based confidence
 * @param {number} horizontalLines - Number of horizontal lines
 * @param {number} verticalLines - Number of vertical lines
 * @returns {number} Confidence score
 */
function calculateLineConfidence(horizontalLines, verticalLines) {
    if (horizontalLines >= config.lines.minHorizontal && verticalLines >= config.lines.minVertical) {
        return config.confidence.maxLineConfidence;
    } else if (horizontalLines >= config.lines.minHorizontal - 1 && verticalLines >= config.lines.minVertical) {
        return config.confidence.mediumLineConfidence;
    }
    return 0;
}

/**
 * Detect if an image contains a size chart
 * @param {string} imagePathOrUrl - Path or URL of the image
 * @param {Array} tempFiles - Array to track temporary files for cleanup
 * @returns {Promise<{hasSizeChart: boolean, confidence: number, details: object}>}
 */
async function detectSizeChart(imagePathOrUrl, tempFiles = []) {
    let tempFile = null;
    try {
        // If it's a URL, download it first
        if (imagePathOrUrl.startsWith('http')) {
            tempFile = await downloadImageToTemp(imagePathOrUrl);
            imagePathOrUrl = tempFile.path;
            // Add to tempFiles array for later cleanup
            if (tempFiles) {
                tempFiles.push(tempFile);
            }
        }

        // Convert to JPEG for processing
        const jpegBuffer = await imageProcessor.convertToJpeg(imagePathOrUrl);
        
        // Analyze text
        const { words, keywordMatches } = await textAnalyzer.analyzeText(jpegBuffer);
        
        // Calculate confidence score
        const confidence = textAnalyzer.calculateKeywordConfidence(keywordMatches);
        
        // Determine if this is a size chart
        const isSizeChart = confidence > config.confidence.threshold;

        return {
            error: null,
            answer: isSizeChart ? "YES" : "NO",
            hasSizeChart: isSizeChart,
            confidence,
            details: {
                keywordMatches,
                detectedText: words,
                confidence
            }
        };
    } catch (error) {
        // If error occurs and tempFile exists but wasn't added to array
        if (tempFile && !tempFiles.includes(tempFile)) {
            await tempFile.cleanup();
        }

        console.error(`Error processing image ${imagePathOrUrl}:`, error);
        return {
            error: error.message,
            answer: "NO",
            hasSizeChart: false,
            confidence: 0,
            details: null
        };
    }
}

module.exports = {
    detectSizeChart
}; 