#!/bin/bash

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/manual/installation"
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Please create .env file first by copying .env.example"
    echo "cp .env.example .env"
    echo "Then edit .env with your actual values"
    exit 1
fi

echo "Setting up GitHub secrets from .env file..."

# Read .env file and set secrets
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # Remove leading/trailing whitespace
    key=$(echo $key | xargs)
    value=$(echo $value | xargs)
    
    # Skip lines without proper key=value format
    [[ -z $value ]] && continue
    
    # Remove any inline comments from value
    value=$(echo $value | cut -d'#' -f1 | xargs)
    
    echo "Setting secret: $key"
    echo "$value" | gh secret set "$key"
done < .env

echo "Done! All secrets have been set."
echo "You can verify them in your repository's Settings > Secrets and Variables > Actions" 