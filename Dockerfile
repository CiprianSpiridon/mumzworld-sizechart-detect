# Use Node.js LTS version
FROM node:20-bullseye

# Install Tesseract OCR and its dependencies
RUN apt-get update && \
    apt-get install -y tesseract-ocr \
    tesseract-ocr-eng \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create directories for data and results
RUN mkdir -p /usr/src/app/csv-data && \
    mkdir -p /usr/src/app/results && \
    mkdir -p /usr/src/app/images && \
    mkdir -p /usr/src/app/temp && \
    # Set permissions (node user has uid 1000)
    chown -R node:node /usr/src/app && \
    chmod -R 755 /usr/src/app

# Switch to non-root user
USER node

# Set volume mount points
VOLUME ["/usr/src/app/csv-data", "/usr/src/app/results", "/usr/src/app/images"]

# Command to run the application
# This will be overridden by docker run command arguments
CMD ["node", "index.js"] 