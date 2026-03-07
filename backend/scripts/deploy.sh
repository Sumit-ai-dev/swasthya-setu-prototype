#!/bin/bash

# Configuration
AWS_REGION="ap-south-1"
ECR_REPO_NAME="swasthya-setu-backend"
LAMBDA_FUNCTION_NAME="swasthya-setu-api"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Starting Backend Deployment to AWS Lambda..."

# 1. Login to Amazon ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 2. Build the Docker image
echo "📦 Building Docker image..."
docker build -t $ECR_REPO_NAME .

# 3. Tag the image
echo "🏷️ Tagging image..."
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# 4. Push the image to ECR
echo "⬆️ Pushing image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# 5. Update Lambda function code
echo "🔄 Updating Lambda function: $LAMBDA_FUNCTION_NAME..."
aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --image-uri $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest \
    --region $AWS_REGION

echo "✅ Backend Deployment Complete!"
