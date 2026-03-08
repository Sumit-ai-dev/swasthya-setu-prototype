#!/bin/bash

# Configuration
AWS_REGION="ap-south-1"
ECR_REPO_NAME="swasthya-setu-backend"
LAMBDA_FUNCTION_NAME="swasthya-setu-api"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:role/swasthya-setu-lambda-role"
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest"

echo "🚀 Starting Backend Deployment to AWS Lambda..."

# 1. Login to Amazon ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# 2. Build the Docker image for arm64 (since Mac is M-series)
echo "📦 Building Docker image..."
docker build --platform linux/arm64 --provenance=false -t $ECR_REPO_NAME .

# 3. Tag the image
echo "🏷️ Tagging image..."
docker tag $ECR_REPO_NAME:latest $IMAGE_URI

# 4. Push the image to ECR
echo "⬆️ Pushing image to ECR..."
docker push $IMAGE_URI

# 5. Check if Lambda function exists and Create/Update
echo "🔄 Updating Lambda function: $LAMBDA_FUNCTION_NAME..."

if aws lambda get-function --function-name $LAMBDA_FUNCTION_NAME --region $AWS_REGION >/dev/null 2>&1; then
    echo "Function exists. Updating code..."
    aws lambda update-function-code \
        --function-name $LAMBDA_FUNCTION_NAME \
        --image-uri $IMAGE_URI \
        --region $AWS_REGION
else
    echo "Function doesn't exist. Creating new function..."
    aws lambda create-function \
        --function-name $LAMBDA_FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$IMAGE_URI \
        --role $ROLE_ARN \
        --architectures arm64 \
        --timeout 60 \
        --memory-size 512 \
        --region $AWS_REGION
fi

echo "✅ Backend Deployment Complete!"
