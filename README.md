# 🏥 Swasthya-Setu — स्वास्थ्य-सेतु

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.13-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900.svg)
![Status](https://img.shields.io/badge/Status-Live%20on%20AWS-brightgreen.svg)

> **AI for Bharat Hackathon 2026 Submission**
>
> *Swasthya-Setu ("Health Bridge") demonstrates how Generative AI on AWS can support frontline healthcare workers and patients in rural India — with fast AI triage, a guideline-grounded medical chatbot, and a patient management system — all deployed live on AWS.*

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (CloudFront)** | https://d74rck1rcmkfd.cloudfront.net |
| **Backend API (API Gateway)** | https://5zdiwo4lfl.execute-api.ap-south-1.amazonaws.com/api/v1 |
| **API Docs (Swagger)** | https://5zdiwo4lfl.execute-api.ap-south-1.amazonaws.com/api/v1/docs |

---

## 🎯 Problem Statement

Rural India faces a severe healthcare accessibility crisis:
- **600M+** people live in rural areas with limited access to doctors
- Frontline health workers (ASHAs, ANMs) lack structured decision-support tools
- Patients travel hours to clinics for conditions that can be triaged remotely
- No affordable, multilingual, AI-powered health guidance exists at scale

**Swasthya-Setu** is a working proof-of-concept that shows how AI can bridge this gap — today.

---

## ✨ Features (All Live & Functional)

### 1. 🧑‍⚕️ Patient Management
- Register patients with name, age, and gender (Male/Female)
- Persistent patient profiles stored in AWS RDS PostgreSQL
- Full consultation history per patient (triage + chat logs)
- Search and browse all registered patients

### 2. 🚨 AI Symptom Triage (RED / YELLOW / GREEN)
- Enter symptoms in **Hindi or English** — multilingual input supported
- Powered by **GPT-4o-mini** for fast, structured classification
- Returns one of three clinically meaningful levels:
  - 🔴 **RED** — Emergency: Immediate hospital referral
  - 🟡 **YELLOW** — Priority: Visit clinic or pharmacy
  - 🟢 **GREEN** — Non-urgent: Home care with guidance
- Includes confidence score, actionable advice, and clinical reasoning
- Every triage is logged to the database for analytics

### 3. 💬 Medical AI Chatbot (RAG-Based)
- Conversational Q&A powered by **GPT-4o-mini** + **Retrieval-Augmented Generation**
- Answers grounded in **WHO guidelines, NHM advisories, and Ayushman Bharat** documentation
- Shows cited sources for every response — transparent and trustworthy
- Session memory for multi-turn conversations
- Embeddings stored in **pgvector on AWS RDS** via **Amazon Bedrock Titan**

### 4. 📊 Analytics Dashboard
- Real-time consultation counts
- Triage distribution breakdown (RED / YELLOW / GREEN)
- Chat interaction metrics
- Live data from production database

---

## 🏗️ Architecture

```
User (Browser)
      │
      ▼
Amazon CloudFront  ──────────────────  Amazon S3
(CDN, HTTPS, SSL)                    (React Frontend)
      │
      ▼
Amazon API Gateway (ap-south-1)
      │
      ▼
AWS Lambda — FastAPI via Mangum adapter
      │
      ├── OpenAI GPT-4o-mini  (Triage + Chatbot LLM)
      ├── Amazon Bedrock Titan (Embeddings for RAG)
      ├── Amazon RDS PostgreSQL + pgvector (Patient data + Vector store)
      └── LangChain (RAG orchestration)
```

### AWS Services Used
| Service | Purpose |
|---|---|
| **AWS Lambda** | Serverless backend (FastAPI app via Mangum) |
| **Amazon API Gateway** | HTTP routing and CORS |
| **Amazon RDS (PostgreSQL)** | Patient data + pgvector embeddings |
| **Amazon S3** | Frontend static hosting |
| **Amazon CloudFront** | CDN, HTTPS, global delivery |
| **Amazon ECR** | Docker image registry for Lambda |
| **Amazon Bedrock (Titan)** | Vector embeddings for RAG knowledge base |

---

## 🗂️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Python 3.13, FastAPI, Mangum |
| **AI / LLM** | OpenAI GPT-4o-mini |
| **RAG** | LangChain, pgvector, Amazon Bedrock Titan Embeddings |
| **Database** | PostgreSQL (AWS RDS), SQLAlchemy |
| **Deployment** | Docker, AWS Lambda (arm64), ECR, API Gateway |

---

## 🚀 Run Locally (Docker)

```bash
# Clone the repo
git clone https://github.com/Sumit-ai-dev/swasthya-setu-prototype.git
cd swasthya-setu-prototype

# Start everything with Docker Compose
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

**Required environment variables** — copy `backend/.env.example` to `backend/.env` and fill in:
```env
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/swasthya_setu
EMBEDDING_PROVIDER=local   # or 'bedrock' for AWS Titan
TRIAGE_MODEL_ID=gpt-4o-mini
CHATBOT_MODEL_ID=gpt-4o-mini
```

---

## ☁️ AWS Production Deployment

### Backend (Lambda via ECR)
```bash
cd backend
bash scripts/deploy.sh
```

This script:
1. Builds the Docker image for `linux/arm64`
2. Pushes to Amazon ECR in `ap-south-1`
3. Creates or updates the Lambda function
4. Applies environment configuration

### Frontend (S3 + CloudFront)
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://swasthya-setu-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

### Database Initialization
```bash
cd backend
export DATABASE_URL=postgresql+psycopg2://...

# Create tables
python3 -m app.scripts.init_db

# Seed WHO/NHM medical knowledge base
python3 -m app.scripts.seed_medical_data
```

---

## 🔬 Clinical Standards

The triage engine is calibrated against **WHO Emergency Triage Assessment and Treatment (ETAT)** guidelines:

- 🔴 **RED** — Airway, Breathing, Circulation, or Disability compromise; cancer/malignancy indicators; severe fever in infants
- 🟡 **YELLOW** — Stable but serious conditions requiring clinical investigation; persistent symptoms; chronic conditions
- 🟢 **GREEN** — Mild self-limiting symptoms; home care appropriate

> ⚠️ **Disclaimer**: Swasthya-Setu is an AI demonstration prototype. It is not a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare provider.

---

## 🧪 Testing

```bash
cd backend
pytest app/tests/test_clinical_triage.py -v
```

Tests verify triage classification correctness across critical symptom profiles including fever, chest pain, respiratory distress, and oncology red flags.

---

## 📁 Project Structure

```
swasthya-setu-prototype/
├── backend/
│   ├── app/
│   │   ├── api/api_v1/endpoints/   # patients, triage, chatbot, analytics
│   │   ├── core/config.py          # Pydantic settings
│   │   ├── db/                     # SQLAlchemy models + session
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   ├── services/               # RAG service, LLM calls
│   │   └── scripts/                # DB init, seed scripts
│   ├── Dockerfile                  # Lambda-compatible container
│   ├── requirements.txt
│   └── scripts/deploy.sh           # AWS Lambda deployment
├── frontend/
│   ├── src/
│   │   ├── components/             # PatientDashboard, Triage, Chatbot, Analytics
│   │   ├── api.js                  # Axios API client
│   │   └── App.jsx
│   └── scripts/deploy.sh           # S3 + CloudFront deployment
└── docker-compose.yml
```

---

## 🛣️ Future Roadmap

- [ ] **Offline-first Android app** — DistilBERT on-device triage for no-internet zones
- [ ] **Indian Sign Language (ISL) support** — accessibility for deaf patients
- [ ] **eSanjeevani / ABDM integration** — connect with national health ID
- [ ] **Voice input in regional languages** — Telugu, Tamil, Bengali, Marathi
- [ ] **Village-level health worker dashboards** — ASHA/ANM portal
- [ ] **Outbreak detection** — anomaly detection from triage data patterns

---

## 👨‍💻 Team

Built by **Sumit Das** for the **AI for Bharat Hackathon 2026** 🇮🇳

---

*स्वास्थ्य-सेतु — Bridging India's healthcare gap, one consultation at a time.*
