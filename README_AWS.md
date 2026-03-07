# AWS Deployment Guide: Swasthya-Setu 🚀

This document provides instructions for deploying the Swasthya-Setu prototype to AWS for the AI for Bharat Hackathon.

## 🏗️ Architecture

- **Frontend**: React (Vite) → AWS S3 (Bucket) → AWS CloudFront (CDN)
- **Backend**: FastAPI (Python 3.13) → AWS Lambda (via Mangum) → Amazon API Gateway
- **Database**: PostgreSQL with `pgvector` → Amazon RDS (Postgres 16) → RDS Proxy (for Lambda connection pooling)
- **AI/LLM**: Amazon Bedrock (Claude 3 Haiku / Llama 3)

---

## 🛠️ Step-by-Step Deployment

### 1. Database Setup (RDS)
1.  Create an **Amazon RDS for PostgreSQL** (v16+) instance.
2.  Enable the **`pgvector`** extension:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
3.  Set up an **RDS Proxy** to manage connection spikes from Lambda.

### 2. Backend Deployment (AWS Lambda)
1.  **Package the Backend**:
    - Zip the `backend` directory including `requirements.txt`.
    - Or build a Docker image using the `Dockerfile` (recommended for Large Language Model dependencies).
2.  **Create Lambda Function**:
    - Set Runtime to `Python 3.13` (if using ZIP) or `Image` (if using Docker).
    - Set the Handler to `app.main.handler`.
3.  **Environment Variables**:
    - `POSTGRES_SERVER`, `POSTGRES_DB`, etc. (Point to RDS Proxy endpoint).
    - `AWS_REGION`.
    - `EMBEDDING_PROVIDER=bedrock` (for production).
4.  **Attach IAM Policy**:
    - Use the provided `aws/iam_policy_bedrock_least_privilege.json` to allow Bedrock access.

### 3. Frontend Deployment (S3 + CloudFront)
1.  **Build the App**:
    ```bash
    cd frontend
    npm run build
    ```
2.  **Upload to S3**:
    - Create an S3 bucket and upload the contents of `dist/`.
    - Set the bucket to "Static Website Hosting" (or use CloudFront).
3.  **CloudFront Setup**:
    - Point CloudFront to your S3 bucket.
    - Set up an SSL certificate (ACM) for HTTPS.

---

## 📌 Post-Deployment Checks
- Run `python app/scripts/seed_medical_data.py` (updated to point to production RDS) to index guidelines.
- Verify the **Analytics Dashboard** displays "Live Data" from RDS.
