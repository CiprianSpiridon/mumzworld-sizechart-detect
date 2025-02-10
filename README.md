# Size Chart Detection

A Node.js application that detects size charts in product images using image processing and OCR.

## Features

- Detects table structures in images
- Performs OCR to identify size-related text
- Supports multiple image formats (JPG, PNG, WebP)
- Provides confidence scores and detailed analysis
- Pure Node.js implementation
- Processes CSV files with image URLs
- Parallel image processing for better performance

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

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mumzworld-sizechart-detection.git
cd mumzworld-sizechart-detection
```

2. Install dependencies:
```bash
npm install
```

## Usage

There are two ways to use this script:

### 1. Process a CSV File with Image URLs

This is the recommended method for bulk processing. You can use either a local CSV file or a URL.

#### Using a Local CSV File:
```bash
# Create your CSV file with columns: sku,image 1,image 2,image 3
# Then run:
node index.js --csv ./path/to/your/input.csv
```

#### Using a CSV File from URL:
```bash
node index.js --csv https://example.com/path/to/input.csv
```

The script will:
1. Read the CSV file
2. Process each row in parallel
3. Create an output file with `-processed` added to the name
   - Example: `input.csv` → `input-processed.csv`

### 2. Process a Directory of Images

If you have local images organized in folders:

```bash
# Option 1: Using npm script
npm run detect ./path/to/images

# Option 2: Direct node command
node index.js ./path/to/images
```

Your images should be organized like this:
```
images/
  SKU123/
    image1.jpg
    image2.webp
  SKU456/
    image3.jpg
    image4.webp
```

The script will:
1. Use the root folder name for the output file (e.g., `images-processed.csv`)
2. Treat each subfolder name as the SKU
3. Process up to 3 images per SKU folder (sorted alphabetically)
4. Generate a CSV file with the same format as CSV processing

For example, running:
```bash
node index.js ./product-images
```

Will create `product-images-processed.csv` with:
```csv
sku,image 1,image 2,image 3,image 1 result,image 2 result,image 3 result
SKU123,image1.jpg,image2.webp,,YES,NO,
SKU456,image3.jpg,image4.webp,,NO,YES,
```

### Quick Start Example

1. Create a test CSV file named `test.csv`:
```csv
sku,image 1,image 2,image 3
SKU123,http://example.com/image1.jpg,http://example.com/image2.jpg,http://example.com/image3.jpg
```

2. Run the script:
```bash
node index.js --csv test.csv
```

3. Check the results in `test-processed.csv`

### Console Output

While running, you'll see progress information like this:

```
Processing CSV file: ./csv-data/sku-size1.csv
Output will be saved to: csv-data/sku-size1-processed.csv

Processing row 1 - SKU: GACS-IN0IN00176YAF007-White-CONFIG
├─ Image 1: https://s3-pwa-prod.mumzworld.com/media/catalog...
├─ Image 2: https://s3-pwa-prod.mumzworld.com/media/catalog...
└─ Image 3: empty
   ├─ Image 2 Result: NO (Confidence: 0.0%)
   ├─ Image 1 Result: NO (Confidence: 0.0%)

[... more rows ...]
```

### Output Format

The script generates a CSV file with these columns:
```csv
sku,image 1,image 2,image 3,image 1 result,image 2 result,image 3 result
```

Each `result` column will contain:
- `YES`: Image contains a size chart
- `NO`: Image does not contain a size chart
- `ERROR`: Failed to process image
- Empty: No image URL provided

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

4. CSV Processing:
   - Downloads images from URLs
   - Processes images in parallel
   - Caches downloaded images for efficiency
   - Provides detailed progress logging
   - Automatically cleans up temporary files

## Dependencies

- `node-tesseract-ocr`: OCR functionality
- `sharp`: Image processing and format conversion
- `jimp`: Pixel-level image analysis
- `csv-parse` & `csv-stringify`: CSV file handling
- `axios`: Image downloading from URLs 