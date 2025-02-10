# Size Chart Detection

A Node.js application that detects size charts in product images using image processing and OCR.

## Features

- Detects table structures in images
- Performs OCR to identify size-related text
- Supports multiple image formats (JPG, PNG, WebP)
- Provides confidence scores and detailed analysis
- Pure Node.js implementation

## Prerequisites

- Node.js >= 14.0.0
- Tesseract OCR

### Installing Tesseract OCR

#### macOS
```bash
brew install tesseract
```

#### Ubuntu/Debian
```bash
sudo apt-get install tesseract-ocr
```

#### Windows
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Usage

Run the script on a folder containing product images:

```bash
npm run detect ./path/to/images
```

Or directly with Node:

```bash
node index.js ./path/to/images
```

### Input Directory Structure

The script expects a directory structure like:
```
images/
  sku-1/
    image1.jpg
    image2.webp
  sku-2/
    image3.jpg
    image4.webp
```

### Output

For each image, the script provides:
- Clear YES/NO answer if it's a size chart
- Confidence score
- Number of detected lines
- Number of size-related keywords found
- Sample of detected text

## How it Works

1. Image Processing:
   - Converts image to grayscale
   - Performs edge detection
   - Detects horizontal and vertical lines

2. Text Analysis:
   - Uses Tesseract OCR to extract text
   - Searches for size-related keywords
   - Analyzes table structures

3. Confidence Scoring:
   - Combines structural analysis (lines) with textual analysis (keywords)
   - Provides detailed confidence breakdown

## Dependencies

- `node-tesseract-ocr`: OCR functionality
- `sharp`: Image processing and format conversion
- `jimp`: Pixel-level image analysis 