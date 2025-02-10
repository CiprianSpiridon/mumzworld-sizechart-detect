const tesseract = require('node-tesseract-ocr');
const config = require('../config');

/**
 * Perform OCR on an image and analyze the text
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<{text: string, keywordMatches: number}>}
 */
async function analyzeText(imageBuffer) {
    try {
        const text = await tesseract.recognize(imageBuffer, config.tesseract);
        const lowerText = text.toLowerCase();
        
        // Count keyword matches
        const keywordMatches = config.keywords.reduce((count, keyword) => 
            count + (lowerText.includes(keyword) ? 1 : 0), 0);
        
        // Get sample words
        const words = text.split(/\s+/)
            .filter(word => word.trim())
            .slice(0, config.output.maxSampleWords);
        
        return {
            text: lowerText,
            words,
            keywordMatches
        };
    } catch (error) {
        console.error('Error in text analysis:', error);
        return {
            text: '',
            words: [],
            keywordMatches: 0
        };
    }
}

/**
 * Calculate confidence based on text analysis
 * @param {number} keywordMatches - Number of matched keywords
 * @returns {number} Confidence score
 */
function calculateKeywordConfidence(keywordMatches) {
    return Math.min(
        config.confidence.maxKeywordConfidence,
        (keywordMatches / config.confidence.keywordsPerMaxConfidence) * config.confidence.keywordMultiplier
    );
}

module.exports = {
    analyzeText,
    calculateKeywordConfidence
}; 