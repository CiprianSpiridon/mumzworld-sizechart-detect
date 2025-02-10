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

1. Node.js >= 14.0.0
2. Tesseract OCR:
   ```bash
   # macOS
   brew install tesseract
   
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr
   
   # Windows
   # Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
   ```

## Installation

```bash
git clone https://github.com/CiprianSpiridon/mumzworld-sizechart-detect.git
cd mumzworld-sizechart-detect
npm install
```

## Usage

### Process Images Directory
Process a folder containing SKU subfolders with images:
```bash
# Process all SKUs in the images directory
node index.js ./images

# Directory structure example:
images/
├── SKU123/
│   ├── 1.jpg
│   ├── 2.webp
│   └── 3.png
└── SKU456/
    ├── front.jpg
    └── back.png
```

### Process CSV File
Supports local files, remote URLs, and Google Sheets:

```bash
# Local CSV
node index.js --csv ./csv-data/sku-size1.csv

# Remote CSV
node index.js --csv https://cdn.example.com/products/size-charts.csv

# Google Sheet
node index.js --csv "https://docs.google.com/spreadsheets/d/18lJiQgihyP4ejH48U1W7lN_SDCi4DGMOUgBsLm-G_Uc/edit"
```

CSV format example:
```csv
sku,image 1,image 2,image 3
SKU123,https://cdn.example.com/products/SKU123-1.jpg,https://cdn.example.com/products/SKU123-2.jpg,https://cdn.example.com/products/SKU123-3.jpg
SKU456,https://cdn.example.com/products/SKU456-front.jpg,https://cdn.example.com/products/SKU456-back.jpg,
SKU789,https://cdn.example.com/products/SKU789-main.webp,,
```

For Google Sheets:
- Must be publicly accessible or shared with view access
- First sheet should contain the data
- Same column headers as CSV format
- Example sheet: [Size Charts Template](https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit?usp=sharing)

Results are saved in the `results` directory with timestamp prefix, for example:
```
results/
└── 20240210_055830_sku-size1-processed.csv
```

## Deployment

See [AWS Deployment Guide](AWS_DEPLOYMENT.md) for deployment instructions.

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