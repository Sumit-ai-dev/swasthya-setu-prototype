# Swasthya-Setu MVP 🏥

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)

> **AI for Bharat Hackathon Submission**
> 
> A cloud-based prototype demonstrating how AI can reduce healthcare access gaps in rural India by providing fast, structured symptom triage and reliable, guideline-grounded health guidance.

---

## 📖 Overview

Rural India faces limited access to specialists and overloaded public health infrastructure. **Swasthya-Setu** is an AI-powered health assistant designed to support frontline healthcare workers and patients by offering:

1. **AI Symptom Triage**: Enter symptoms in Hindi or English and get classified into GREEN (Home Care), YELLOW (Clinic), or RED (Emergency Hospital).
2. **Medical AI Assistant (RAG)**: A conversational assistant grounded in WHO and National Health Mission (NHM) guidelines for trusted medical advice on fever, nutrition, hypertension, and more.
3. **Analytics Dashboard**: Real-time insights into system usage and regional triage distributions.

---

## 🏗️ Architecture & Tech Stack

The architecture is built for AWS deployment (Lambda, API Gateway, S3, RDS) to stay within hackathon limits while remaining highly available.

### **Frontend** (`/frontend`)
- **React 18** + **Vite**
- **Tailwind CSS** (for responsive, offline-friendly UI)
- Hosted on S3 + CloudFront (Production)

### **Backend API** (`/backend`)
- **FastAPI** (Python 3.11)
- **Amazon Bedrock** (Production Optional): 
  - `Claude 3 Haiku` for fast symptom triage
  - `Llama 3` for RAG-based chatbot responses
- **HuggingFace Sentence-Transformers**: Local embeddings (`all-MiniLM-L6-v2`) for production-grade retrieval without mandatory AWS keys during dev.
- **Three.js & Framer Motion**: Advanced 3D medical backgrounds with optimized stability and safety guards for rendering performance.
- **PostgreSQL + pgvector**: Vector database for document embedding retrieval (runs locally via Docker).
- **AWS Lambda**: Deployable via the **Mangum** adapter.

###- **Status**: Phase 3 Complete ✅ (Production-ready AI Prototype)
- **Latest Features**:
  - Real-time Analytics Dashboard with DB Logging
  - AWS Lambda & S3/CloudFront Deployment Readiness
  - Verified RAG Bot with automated WHO/NHM data ingestion
  - Optimized 3D UI for mobile and desktop stability

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Docker Desktop**: Required for the vector database.
- **Python 3.11+**: Backend takes advantage of modern typing.
- **Node.js 18+**: For the React frontend.

---

### 2. Backend Setup (`/backend`)

The backend uses **FastAPI** and **PostgreSQL (pgvector)**.

```bash
cd backend

# A. Start the Vector Database
docker compose up -d

# B. Setup Python Environment
python3 -m venv venv
source venv/bin/activate

# C. Install Dependencies
pip install -r requirements.txt

# D. Environment Configuration
cp .env.example .env
# Edit .env and set:
# DATABASE_URL=postgresql://user:password@localhost:5432/health_db
# AWS_REGION=ap-south-1 (if using Bedrock)

# E. Initialize and Seed Database
# This creates the pgvector extension and loads WHO/NHM guidelines
export PYTHONPATH=.
python app/scripts/init_db.py
python app/scripts/seed_medical_data.py

# F. Run the API
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Frontend Setup (`/frontend`)

```bash
cd frontend

# A. Install Dependencies
npm install

# B. Environment Configuration
# Create .env and set:
# VITE_API_URL=http://localhost:8000/api/v1

# C. Run Development Server
npm run dev
```

- **URL**: [http://localhost:5173](http://localhost:5173)

---

## 🏥 Clinical Standards & Safety

### **WHO ETAT / IMAI Integration**
The triage engine is strictly calibrated against WHO clinical standards. 

- **RED (Emergency)**: Immediate hospital referral for Airway, Breathing, Circulation, or Disability signs.
- **YELLOW (Priority)**: Serious but stable conditions requiring clinical investigation.
- **GREEN (Non-Urgent)**: Home care for mild, self-limiting symptoms.

### **Specialized Oncology Guardrails**
As per the latest prototype update, any indicators of **Cancer**, **Malignancy**, or **Chronic Lumps** are automatically upgraded to **RED PRIORITY**. This ensures high-urgency visibility for oncology risks in rural triage scenarios.

---

## 🧪 Verification
Run the clinical test suite to verify triage logic:
```bash
cd backend
pytest app/tests/test_clinical_triage.py -v
```

---

## 📌 Roadmap & Progress

- [x] **RAG Implementation**: pgvector + local embeddings (`all-MiniLM-L6-v2`).
- [x] **Clinical Triage**: WHO-standard logic with specialized Oncology RED-flags.
- [x] **Premium UI**: 3D medical backgrounds with Framer Motion.
- [x] **Analytics**: Live DB logging for consultation distribution.
- [x] **CORS Stability**: Explicit origin handling for local development.

---

*Built with ❤️ for AI For Bharat Hackathon 2026* 🇮🇳
