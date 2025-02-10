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
        minLineLength: 0.15,
        whitePixelThreshold: 128
    },

    // Confidence Scoring
    confidence: {
        threshold: 0.85,
        maxKeywordConfidence: 0.95,
        keywordMultiplier: 0.8,
        keywordsPerMaxConfidence: 4,
        
        // Strict keyword matching
        exactMatchOnly: true,
        ignoreNonKeywords: false,
        partialMatchWeight: 0,
        nonKeywordPenalty: 0.8,
        
        // Required matches (must find at least one from each category)
        requireCategories: {
            sizeWords: true,
            measurements: true,
            units: true,
            exactPhrases: true
        },
        
        // Category weights
        categoryWeights: {
            exactPhrases: 1.0,
            sizeWords: 0.7,
            measurements: 0.6,
            units: 0.5,
            sizeIndicators: 0.4
        },

        // Penalties for non-size-related content
        contentPenalties: {
            musicTerms: 0.9,
            bookTerms: 0.9,
            interactiveTerms: 0.8,
            marketingTerms: 0.7,
            imageTerms: 0.7
        }
    },

    // Keywords for Size Chart Detection
    keywords: [
        // Critical exact phrases (if found, very high confidence)
        'size chart', 'size guide', 'sizing chart',
        'measurement chart', 'measurements chart',
        
        // Supporting keywords (add to confidence)
        'size', 'sizes', 'sizing',
        'measurement', 'measurements',
        'dimensions', 'chart', 'guide',
        
        // Common measurements (must find at least one)
        'chest', 'waist', 'hip', 'length',
        'shoulder', 'sleeve', 'bust',
        
        // Size indicators
        's', 'm', 'l', 'xl', 'xxl',
        'small', 'medium', 'large',
        
        // UK sizes
        'uk 4', 'uk 6', 'uk 8', 'uk 10', 'uk 12',
        'uk 14', 'uk 16', 'uk 18', 'uk 20',
        'uk size', 'uk sizing',
        
        // US sizes
        'us 0', 'us 2', 'us 4', 'us 6', 'us 8',
        'us 10', 'us 12', 'us 14', 'us 16',
        'us size', 'us sizing',
        
        // EU sizes
        'eu 32', 'eu 34', 'eu 36', 'eu 38', 'eu 40',
        'eu 42', 'eu 44', 'eu 46', 'eu 48', 'eu 50',
        'eur 32', 'eur 34', 'eur 36', 'eur 38', 'eur 40',
        'eur 42', 'eur 44', 'eur 46', 'eur 48', 'eur 50',
        'eu size', 'eu sizing', 'eur size', 'eur sizing',
        'european size', 'european sizing',
        
        // Generic size numbers (often used in both UK/US)
        'size 2', 'size 4', 'size 6', 'size 8',
        'size 10', 'size 12', 'size 14',
        
        // Baby sizes - Age based
        'newborn', 'preemie',
        '0-3m', '3-6m', '6-9m', '9-12m',
        '0-3 months', '3-6 months', '6-9 months', '9-12 months',
        '12-18 months', '18-24 months',
        '12-18m', '18-24m',
        
        // Baby sizes - Number based
        'nb', '3m', '6m', '9m', '12m', '18m', '24m',
        
        // Children's sizes
        '2t', '3t', '4t', '5t',
        '2y', '3y', '4y', '5y', '6y',
        'age 2', 'age 3', 'age 4', 'age 5', 'age 6',
        'years 2', 'years 3', 'years 4', 'years 5',
        
        // Baby specific measurements
        'head circumference', 'head size',
        'body length', 'height',
        'weight', 'age',
        
        // Units
        'cm', 'inch', 'inches', '"', 'in',
        'kg', 'lbs', 'pounds'
    ],

    // Negative keywords that reduce confidence
    negativeKeywords: [
        // damn stupid girl in a dress false positive
        'click to hear the music',
        // Music related
        'music', 'song', 'play', 'hear', 'sound', 'note', 'melody', 'musical',
        'tune', 'audio', 'listen', 'rhythm', 'beat', 'dance', 'singing',
        
        // Book related
        'book', 'novel', 'author', 'read', 'series', 'academy', 'vampire',
        'story', 'chapter', 'volume', 'edition', 'publication',
        
        // Interactive elements
        'click', 'tap', 'press', 'button', 'interactive', 'select', 'choose',
        'touch', 'swipe', 'scroll', 'navigate', 'menu', 'option',
        
        // Entertainment
        'game', 'video', 'watch', 'movie', 'entertainment', 'play', 'fun',
        'enjoy', 'experience', 'adventure', 'exciting', 'amazing',
        
        // Generic marketing
        'sale', 'discount', 'offer', 'price', 'buy', 'shop', 'purchase',
        'deal', 'special', 'limited', 'exclusive', 'new', 'collection',
        
        // Image related
        'photo', 'picture', 'image', 'gallery', 'view', 'preview', 'display',
        'show', 'see', 'look', 'preview', 'thumbnail',
        
        // Social/Interactive
        'share', 'like', 'follow', 'subscribe', 'join', 'connect', 'social',
        'community', 'friend', 'group', 'team',
        
        // Generic web terms
        'website', 'online', 'digital', 'web', 'internet', 'site', 'page',
        'link', 'url', 'visit', 'browse'
    ],

    // Output
    output: {
        maxSampleWords: 10
    }
}; 