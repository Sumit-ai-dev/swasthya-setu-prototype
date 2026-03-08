# Swasthya Setu: Production AWS Deployment Guide

This guide follows the official team workflow for deploying Swasthya Setu to AWS in the `ap-south-1` (Mumbai) region.

## Prerequisites
- AWS CLI installed and configured
- Docker installed
- Amazon Bedrock model access (Claude 3 Haiku, Llama 3 8B, Titan Embed v2)

## 1. AWS CLI Configuration
```bash
aws configure
# Enter Access Key ID, Secret Access Key
# Region: ap-south-1
# Format: json
```
Verify: `aws sts get-caller-identity`

## 2. Infrastructure Setup (IAM & RDS)

### IAM Role for Lambda
```bash
# Swasthya Setu Lambda Execution Role
aws iam create-role \
  --role-name swasthya-setu-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach Policies
aws iam attach-role-policy --role-name swasthya-setu-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name swasthya-setu-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess
aws iam put-role-policy --role-name swasthya-setu-lambda-role --policy-name BedrockAccess --policy-document file://aws/iam_policy_bedrock_least_privilege.json
```

### RDS PostgreSQL Instance
```bash
# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier swasthya-setu-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username postgres \
  --master-user-password SwasthyaSetu2026! \
  --db-name swasthya_setu \
  --allocated-storage 20 \
  --publicly-accessible \
  --region ap-south-1
```

## 3. Backend Deployment (Lambda)

### Environment Setup
Update `backend/.env` with your RDS endpoint and model IDs.

### Seed Database
```bash
cd backend
export DATABASE_URL="postgresql://postgres:SwasthyaSetu2026!@<RDS_ENDPOINT>:5432/swasthya_setu"
python app/scripts/init_db.py
python app/scripts/seed_medical_data.py
```

### Deploy to ECR/Lambda
```bash
bash scripts/deploy.sh
```

## 4. Frontend Deployment (CloudFront)
```bash
# Update Frontend API URL
echo "VITE_API_URL=<LAMBDA_URL>/api/v1" > frontend/.env

# Build and Deploy to S3
cd frontend
bash scripts/deploy.sh
```

## Final Deployment Checklist
- [ ] AWS CLI configured
- [ ] Bedrock models enabled
- [ ] IAM Role created
- [ ] RDS instance ready
- [ ] Database seeded
- [ ] Backend live on Lambda
- [ ] Frontend live on CloudFront
