const sharp = require('sharp');
const Jimp = require('jimp');
const config = require('../config');

/**
 * Convert image to JPEG buffer
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Buffer>} JPEG buffer
 */
async function convertToJpeg(imagePath) {
    return sharp(imagePath)
        .jpeg()
        .toBuffer();
}

/**
 * Detect lines in an image using edge detection and line analysis
 * @param {Buffer} imageBuffer - Raw image data
 * @returns {Promise<{horizontalLines: number, verticalLines: number}>}
 */
async function detectLines(imageBuffer) {
    try {
        // Convert to JPEG if needed
        const jpegBuffer = await sharp(imageBuffer)
            .jpeg()
            .toBuffer();

        // Load image with Jimp for pixel-level analysis
        const image = await Jimp.read(jpegBuffer);
        const width = image.getWidth();
        const height = image.getHeight();
        
        // Convert to grayscale and increase contrast
        image.grayscale().contrast(config.image.contrast);
        
        // Edge detection
        const edges = await performEdgeDetection(image, width, height);
        
        // Detect lines
        const { horizontalLines, verticalLines } = await findLines(edges, width, height);
        
        return { horizontalLines, verticalLines };
    } catch (error) {
        console.error('Error in detectLines:', error);
        return { horizontalLines: 0, verticalLines: 0 };
    }
}

/**
 * Perform edge detection on an image
 * @param {Jimp} image - Jimp image object
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Promise<Jimp>} Edge detection result
 */
async function performEdgeDetection(image, width, height) {
    const edges = new Jimp(width, height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
            const up = Jimp.intToRGBA(image.getPixelColor(x, y - 1));
            const down = Jimp.intToRGBA(image.getPixelColor(x, y + 1));
            const left = Jimp.intToRGBA(image.getPixelColor(x - 1, y));
            const right = Jimp.intToRGBA(image.getPixelColor(x + 1, y));
            
            const gradientX = Math.abs(right.r - left.r);
            const gradientY = Math.abs(down.r - up.r);
            
            if (gradientX > config.image.edgeThreshold || gradientY > config.image.edgeThreshold) {
                edges.setPixelColor(Jimp.rgbaToInt(255, 255, 255, 255), x, y);
            } else {
                edges.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 255), x, y);
            }
        }
    }
    
    return edges;
}

/**
 * Find horizontal and vertical lines in an edge-detected image
 * @param {Jimp} edges - Edge-detected image
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Promise<{horizontalLines: number, verticalLines: number}>}
 */
async function findLines(edges, width, height) {
    const minLineLength = Math.min(width, height) * config.image.minLineLength;
    let horizontalLines = 0;
    let verticalLines = 0;
    
    // Detect horizontal lines
    for (let y = 0; y < height; y++) {
        let currentRun = 0;
        for (let x = 0; x < width; x++) {
            const pixel = Jimp.intToRGBA(edges.getPixelColor(x, y));
            if (pixel.r > config.image.whitePixelThreshold) {
                currentRun++;
            } else if (currentRun > 0) {
                if (currentRun >= minLineLength) {
                    horizontalLines++;
                }
                currentRun = 0;
            }
        }
        if (currentRun >= minLineLength) {
            horizontalLines++;
        }
    }
    
    // Detect vertical lines
    for (let x = 0; x < width; x++) {
        let currentRun = 0;
        for (let y = 0; y < height; y++) {
            const pixel = Jimp.intToRGBA(edges.getPixelColor(x, y));
            if (pixel.r > config.image.whitePixelThreshold) {
                currentRun++;
            } else if (currentRun > 0) {
                if (currentRun >= minLineLength) {
                    verticalLines++;
                }
                currentRun = 0;
            }
        }
        if (currentRun >= minLineLength) {
            verticalLines++;
        }
    }
    
    return { horizontalLines, verticalLines };
}

module.exports = {
    convertToJpeg,
    detectLines
}; 