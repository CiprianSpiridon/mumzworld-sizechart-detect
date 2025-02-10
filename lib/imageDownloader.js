const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Check if buffer is an image by looking at magic numbers
 * @param {Buffer} buffer - File buffer to check
 * @returns {boolean} - True if buffer appears to be an image
 */
function isImage(buffer) {
    if (!buffer || buffer.length < 4) return false;
    
    // Check magic numbers for common image formats
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    return (
        hex.startsWith('FFD8') || // JPEG
        hex.startsWith('89504E47') || // PNG
        hex.startsWith('47494638') || // GIF
        hex.startsWith('424D') || // BMP
        hex.startsWith('52494646') // WEBP
    );
}

/**
 * Downloads an image from a URL and returns the buffer
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<Buffer>} - Image buffer
 */
async function downloadImage(imageUrl) {
    try {
        const response = await axios({
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const buffer = Buffer.from(response.data, 'binary');
        
        // Verify the downloaded content is actually an image
        if (!isImage(buffer)) {
            throw new Error('Not a valid image file');
        }

        return buffer;
    } catch (error) {
        if (error.message === 'Not a valid image file') {
            throw error;
        }
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

/**
 * Downloads an image and saves it to a temporary file
 * @param {string} imageUrl - URL of the image to download
 * @returns {Promise<{path: string, cleanup: Function}>} - Path to the downloaded file and cleanup function
 */
async function downloadImageToTemp(imageUrl) {
    let tempPath = null;
    try {
        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Generate unique filename based on URL hash
        const urlHash = crypto.createHash('md5').update(imageUrl).digest('hex');
        tempPath = path.join(tempDir, `${urlHash}.webp`);

        // Download and save the image
        const imageBuffer = await downloadImage(imageUrl);
        await fs.writeFile(tempPath, imageBuffer);

        // Return both the path and a cleanup function
        return {
            path: tempPath,
            cleanup: async () => {
                try {
                    await fs.unlink(tempPath);
                } catch (error) {
                    console.error(`Failed to clean up temp file ${tempPath}:`, error.message);
                }
            }
        };
    } catch (error) {
        // Clean up if there was an error
        if (tempPath) {
            try {
                await fs.unlink(tempPath);
            } catch (cleanupError) {
                console.error(`Failed to clean up temp file ${tempPath}:`, cleanupError.message);
            }
        }
        throw error;
    }
}

/**
 * Cleans up all files in the temp directory
 */
async function cleanupTempFiles() {
    try {
        const tempDir = path.join(process.cwd(), 'temp');
        const files = await fs.readdir(tempDir);
        
        await Promise.all(files.map(file => 
            fs.unlink(path.join(tempDir, file))
                .catch(error => console.error(`Failed to delete ${file}:`, error.message))
        ));

        // Try to remove the temp directory itself
        try {
            await fs.rmdir(tempDir);
        } catch (error) {
            // Ignore if directory is not empty or other errors
        }
    } catch (error) {
        console.error('Error cleaning up temp files:', error.message);
    }
}

module.exports = {
    downloadImage,
    downloadImageToTemp,
    cleanupTempFiles
}; 