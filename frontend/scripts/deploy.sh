#!/bin/bash

# Configuration
S3_BUCKET_NAME="swasthya-setu-frontend-bucket"
CLOUDFRONT_DIST_ID="YOUR_CLOUDFRONT_ID"

echo "🚀 Starting Frontend Deployment to AWS S3 / CloudFront..."

# 1. Build the React app
echo "📦 Building the React app..."
npm run build

# 2. Sync files to S3
echo "⬆️ Syncing dist/ folder to S3 bucket: $S3_BUCKET_NAME..."
aws s3 sync dist/ s3://$S3_BUCKET_NAME --delete

# 3. Invalidate CloudFront cache
if [ "$CLOUDFRONT_DIST_ID" != "YOUR_CLOUDFRONT_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST_ID --paths "/*"
else
    echo "⚠️ CLOUDFRONT_DIST_ID not set. Skipping invalidation."
fi

echo "✅ Frontend Deployment Complete!"
