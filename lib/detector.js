const config = require('../config');
const imageProcessor = require('./imageProcessor');
const textAnalyzer = require('./textAnalyzer');

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
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{hasSizeChart: boolean, confidence: number, details: object}>}
 */
async function detectSizeChart(imagePath) {
    try {
        // Convert to JPEG for processing
        const jpegBuffer = await imageProcessor.convertToJpeg(imagePath);
        
        // Detect lines
        const { horizontalLines, verticalLines } = await imageProcessor.detectLines(jpegBuffer);
        
        // Analyze text
        const { words, keywordMatches } = await textAnalyzer.analyzeText(jpegBuffer);
        
        // Calculate confidence scores
        const lineConfidence = calculateLineConfidence(horizontalLines, verticalLines);
        const keywordConfidence = textAnalyzer.calculateKeywordConfidence(keywordMatches);
        const confidence = Math.max(lineConfidence, keywordConfidence);
        
        // Determine if this is a size chart
        const isSizeChart = confidence > config.confidence.threshold;
        
        return {
            error: null,
            answer: isSizeChart ? "YES" : "NO",
            hasSizeChart: isSizeChart,
            confidence,
            details: {
                hasTable: horizontalLines >= config.lines.minHorizontal && verticalLines >= config.lines.minVertical,
                keywordMatches,
                horizontalLines,
                verticalLines,
                detectedText: words,
                lineConfidence,
                keywordConfidence
            }
        };
    } catch (error) {
        console.error(`Error processing image ${imagePath}:`, error);
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