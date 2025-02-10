# Size Chart Detection

A Node.js application that detects size charts in product images using image processing and OCR.

## Features

- Detects table structures in images
- Performs OCR to identify size-related text
- Supports multiple image formats (JPG, PNG, WebP)
- Provides confidence scores and detailed analysis
- Pure Node.js implementation
- Processes multiple input formats:
  - Local folders with images
  - Local CSV files
  - Remote CSV files
  - Google Sheets
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

The script supports four different ways to process images:

### 1. Process a Local Directory of Images

For processing local images organized in folders:

```bash
node index.js ./path/to/images
```

Directory structure should be:
```
images/
  ├── SKU123/
  │   ├── image1.jpg
  │   └── image2.webp
  └── SKU456/
      ├── image3.jpg
      └── image4.webp
```

The script will:
- Use the folder name as SKU
- Process up to 3 images per SKU (sorted alphabetically)
- Create `TIMESTAMP_images-processed.csv` in the results directory

### 2. Process a Local CSV File

For processing a local CSV file containing image URLs:

```bash
node index.js --csv ./path/to/your/input.csv
```

CSV format should be:
```csv
sku,image 1,image 2,image 3
SKU123,http://example.com/image1.jpg,http://example.com/image2.jpg,http://example.com/image3.jpg
```

### 3. Process a Remote CSV File

For processing a CSV file from a URL:

```bash
node index.js --csv https://example.com/path/to/input.csv
```

The remote CSV should follow the same format as local CSV files.

### 4. Process a Google Sheet

For processing data directly from Google Sheets:

```bash
node index.js --csv "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
```

Requirements for Google Sheets:
- Sheet must be publicly accessible (set to "Anyone with the link" or "Public")
- First sheet should contain the data
- Column headers must be: `sku`, `image 1`, `image 2`, `image 3`

Supported Google Sheet URL formats:
- Regular URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
- Sharing URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing`

## Output Format

For all input methods, the script generates a CSV file in the `results` directory with the format:
```csv
sku,image 1,image 2,image 3,image 1 result,image 2 result,image 3 result
```

Each `result` column will contain:
- `YES`: Image contains a size chart
- `NO`: Image does not contain a size chart
- `ERROR - No image`: No image URL/file provided
- `ERROR - Not a valid image`: File is not a valid image
- `ERROR - Processing failed`: Failed to process the image

## Console Output

While running, you'll see progress information:

```
Processing CSV file: ./csv-data/sku-size1.csv
Output will be saved to: results/20240210_055830_sku-size1-processed.csv

Processing row 1 - SKU: SKU123
├─ Image 1: http://example.com/image1.jpg
├─ Image 2: http://example.com/image2.jpg
└─ Image 3: empty
   ├─ Image 1 Result: YES (Confidence: 85.5%)
   ├─ Image 2 Result: NO (Confidence: 15.2%)
   └─ Image 3 Result: ERROR - No image

Progress: 1/10 rows (10.0%)
Speed: 0.5 rows/sec - Errors: 0
```

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

4. Processing Pipeline:
   - Downloads images from URLs (for CSV/Sheets input)
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