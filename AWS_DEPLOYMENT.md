# AWS Deployment Guide

There are two ways to deploy this application on AWS:

## 1. Manual EC2 Deployment

Launch an EC2 instance with the following command:
```bash
aws ec2 run-instances \
  --image-id ami-0889a44b331db0194 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids your-security-group \
  --subnet-id your-subnet-id \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=sizechart-detection}]' \
  --user-data '#!/bin/bash
    dnf update -y
    dnf install -y docker git
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    mkdir -p /home/ec2-user/data/{csv-data,results,images}
    chown -R ec2-user:ec2-user /home/ec2-user/data
    cd /home/ec2-user
    git clone https://github.com/yourusername/mumzworld-sizechart-detection.git
    cd mumzworld-sizechart-detection
    docker build -t sizechart-detection .
    docker run -d \
      --name sizechart-detection \
      --restart unless-stopped \
      -v /home/ec2-user/data/csv-data:/usr/src/app/csv-data \
      -v /home/ec2-user/data/results:/usr/src/app/results \
      -v /home/ec2-user/data/images:/usr/src/app/images \
      sizechart-detection'
```

## 2. GitHub Actions Deployment

This method uses GitHub Actions with Terraform to automate the infrastructure creation and application deployment.

### Prerequisites
1. GitHub repository with your code
2. AWS IAM user with appropriate permissions
3. GitHub CLI installed (for automated secrets setup)

### Setting Up GitHub Secrets

You have two options to set up the required GitHub secrets:

#### Option A: Automated Setup (Recommended)
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual values:
   ```bash
   nano .env  # or use any text editor
   ```

3. Run the GitHub secrets setup script:
   ```bash
   chmod +x github-setup-secrets.sh
   ./github-setup-secrets.sh
   ```

#### Option B: Manual Setup
1. Go to your GitHub repository's Settings
2. Navigate to Secrets and Variables > Actions
3. Add each of the following secrets:
   - `APP_NAME`: Your application name
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your preferred AWS region
   - `INSTANCE_TYPE`: EC2 instance type
   - `VOLUME_SIZE`: EBS volume size
   - `VOLUME_TYPE`: EBS volume type
   - `INSTANCE_USERNAME`: EC2 instance username
   - `SSH_INGRESS_CIDR`: Allowed IP range for SSH
   - `SSH_PORT`: SSH port number
   - `AMI_PATTERN`: AMI name pattern
   - `AMI_OWNER`: AMI owner ID
   - `SSH_KEY_TYPE`: SSH key type
   - `SSH_KEY_BITS`: SSH key bits
   - `TF_VERSION`: Terraform version
   - `DOCKER_LATEST_TAG`: Docker latest tag name

See `.env.example` for example values and descriptions.

### Deployment

Once the secrets are set up, the deployment will:
1. Create AWS infrastructure using Terraform:
   - VPC and networking components
   - EC2 instance with specified configuration
   - ECR repository
   - Required IAM roles and policies

2. Build and deploy the application:
   - Build Docker image
   - Push to ECR
   - Deploy to EC2
   - Set up automatic container restart

To trigger a deployment:
1. Push to the main branch, or
2. Go to Actions > Deploy to AWS EC2 > Run workflow 