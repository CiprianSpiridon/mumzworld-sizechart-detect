module.exports = {
    // OCR Configuration
    tesseract: {
        lang: "eng",
        oem: 1,
        psm: 3,
    },

    // Image Processing
    image: {
        contrast: 0.5,
        edgeThreshold: 30,
        minLineLength: 0.1, // 10% of image size
        whitePixelThreshold: 128
    },

    // Line Detection
    lines: {
        minHorizontal: 2,
        minVertical: 1,
        horizontalAngleRange: { min: 0, max: 30 },
        verticalAngleRange: { min: 60, max: 120 }
    },

    // Confidence Scoring
    confidence: {
        threshold: 0.4,
        maxLineConfidence: 0.6,
        mediumLineConfidence: 0.4,
        maxKeywordConfidence: 0.8,
        keywordMultiplier: 0.4,
        keywordsPerMaxConfidence: 3
    },

    // Keywords for Size Chart Detection
    keywords: [
        'size', 'chart', 'measurement', 'measurements', 'dimensions',
        'small', 'medium', 'large', 'xl', 'xxl',
        'chest', 'waist', 'hip', 'length', 'width',
        'cm', 'inch', 'inches', '"', 'in'
    ],

    // Output
    output: {
        maxSampleWords: 10
    }
}; 