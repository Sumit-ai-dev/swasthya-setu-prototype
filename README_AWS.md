# Swasthya Setu: Final AWS Deployment Guide (Mac)

This guide provides the official step-by-step process for deploying the Swasthya Setu prototype to AWS in the `ap-south-1` (Mumbai) region.

### Step 1: Install AWS CLI
```bash
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```
Verify: `aws --version`

### Step 2: Configure AWS Credentials
Go to AWS Console → IAM → Users → your user → Security Credentials → Create Access Key → choose "CLI".

Then run:
```bash
aws configure
```
Enter:
- **AWS Access Key ID**: <your key>
- **AWS Secret Access Key**: <your secret>
- **Default region name**: `ap-south-1`
- **Default output format**: `json`

Verify it works: `aws sts get-caller-identity` (You should see your Account ID).

### Step 3: Enable Bedrock Models in AWS Console
Go to AWS Console → Amazon Bedrock → Model access (region: `ap-south-1`) and request access for:
- Claude 3 Haiku (Anthropic)
- Llama 3 8B Instruct (Meta)
- Titan Embed Text v2 (Amazon)
Wait for approval (usually instant or a few minutes).

### Step 4: Create IAM Role for Lambda
```bash
# Create the trust policy file
cat > /tmp/trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create the role
aws iam create-role \
  --role-name swasthya-setu-lambda-role \
  --assume-role-policy-document file:///tmp/trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name swasthya-setu-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name swasthya-setu-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess

# Attach Bedrock policy (from your project's aws/ folder)
aws iam put-role-policy \
  --role-name swasthya-setu-lambda-role \
  --policy-name BedrockAccess \
  --policy-document file://aws/iam_policy_bedrock_least_privilege.json
```

### Step 5: Create RDS PostgreSQL Database
```bash
# Create subnet group first (uses default VPC)
aws rds create-db-subnet-group \
  --db-subnet-group-name swasthya-setu-subnet \
  --db-subnet-group-description "Swasthya Setu DB Subnet" \
  --subnet-ids $(aws ec2 describe-subnets --query 'Subnets[*].SubnetId' --output text | tr '\t' ' ') \
  --region ap-south-1

# Create RDS instance (db.t3.micro = free tier)
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
Wait ~5 minutes for RDS to be ready, then get the endpoint:
```bash
aws rds describe-db-instances \
  --db-instance-identifier swasthya-setu-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region ap-south-1
```
Save this endpoint — you'll need it next.

### Step 6: Set Up Backend .env
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
APP_NAME=Swasthya-Setu API
DEBUG=false
AWS_REGION=ap-south-1
TRIAGE_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
CHATBOT_MODEL_ID=meta.llama3-8b-instruct-v1:0
EMBEDDING_PROVIDER=bedrock
DATABASE_URL=postgresql://postgres:SwasthyaSetu2026!@<YOUR_RDS_ENDPOINT>:5432/swasthya_setu
```

### Step 7: Seed the Database
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export PYTHONPATH=.
export DATABASE_URL="postgresql://postgres:SwasthyaSetu2026!@<YOUR_RDS_ENDPOINT>:5432/swasthya_setu"
export AWS_REGION=ap-south-1
export EMBEDDING_PROVIDER=bedrock

python app/scripts/init_db.py
python app/scripts/seed_medical_data.py
```

### Step 8: Deploy Backend (Docker → ECR → Lambda)
```bash
cd backend
bash scripts/deploy.sh
```
After Lambda is created, get the Function URL:
```bash
aws lambda create-function-url-config \
  --function-name swasthya-setu-api \
  --auth-type NONE \
  --region ap-south-1

# Get the URL
aws lambda get-function-url-config \
  --function-name swasthya-setu-api \
  --query FunctionUrl \
  --output text \
  --region ap-south-1
```
Save this URL — it's your API endpoint.

Set Lambda environment variables:
```bash
RDS_ENDPOINT=<YOUR_RDS_ENDPOINT>

aws lambda update-function-configuration \
  --function-name swasthya-setu-api \
  --environment "Variables={
    DATABASE_URL=postgresql://postgres:SwasthyaSetu2026!@${RDS_ENDPOINT}:5432/swasthya_setu,
    AWS_REGION=ap-south-1,
    EMBEDDING_PROVIDER=bedrock,
    TRIAGE_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0,
    CHATBOT_MODEL_ID=meta.llama3-8b-instruct-v1:0
  }" \
  --region ap-south-1
```

### Step 9: Deploy Frontend (S3 + CloudFront)
Update the API URL in frontend first:
```bash
echo "VITE_API_URL=<YOUR_LAMBDA_FUNCTION_URL>/api/v1" > frontend/.env
```
Then deploy:
```bash
cd frontend
bash scripts/deploy.sh
```
After S3 upload, create CloudFront:
```bash
aws cloudfront create-distribution \
  --distribution-config "{
    \"CallerReference\": \"swasthya-setu-$(date +%s)\",
    \"Origins\": {
      \"Items\": [{
        \"Id\": \"S3Origin\",
        \"DomainName\": \"swasthya-setu-frontend-bucket.s3-website.ap-south-1.amazonaws.com\",
        \"CustomOriginConfig\": {
          \"HTTPPort\": 80, \"HTTPSPort\": 443,
          \"OriginProtocolPolicy\": \"http-only\"
        }
      }],
      \"Quantity\": 1
    },
    \"DefaultCacheBehavior\": {
      \"TargetOriginId\": \"S3Origin\",
      \"ViewerProtocolPolicy\": \"redirect-to-https\",
      \"ForwardedValues\": {\"QueryString\": false, \"Cookies\": {\"Forward\": \"none\"}},
      \"MinTTL\": 0
    },
    \"Comment\": \"Swasthya-Setu Frontend\",
    \"Enabled\": true,
    \"DefaultRootObject\": \"index.html\"
  }" \
  --region ap-south-1
```
Get your live URL:
```bash
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].DomainName' \
  --output text
```

---

## Final Checklist
| Step | Command | Done? |
| :--- | :--- | :--- |
| AWS CLI installed | `aws --version` | |
| Credentials configured | `aws sts get-caller-identity` | |
| Bedrock models enabled | AWS Console | |
| IAM role created | Step 4 | |
| RDS running | Step 5 | |
| DB seeded | Step 7 | |
| Lambda deployed | `bash backend/scripts/deploy.sh` | |
| Frontend live | `bash frontend/scripts/deploy.sh` | |
| CloudFront URL ready | Step 9 | |
