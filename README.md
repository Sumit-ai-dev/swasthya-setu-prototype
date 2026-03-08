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

## 🚀 Quick Start (Docker Orchestration)

Launch the entire stack (Database + Backend + Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ☁️ Production AWS Deployment

For a full cloud deployment in the `ap-south-1` (Mumbai) region using Amazon Bedrock, RDS, and Lambda, follow our:

👉 **[Production AWS Deployment Guide](README_AWS.md)**

---

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
