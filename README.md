# Swasthya-Setu MVP 🏥

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)
![React 18](https://img.shields.io/badge/React-18-blue.svg)

> **AI for Bharat Hackathon Submission**
> 
> A cloud-based prototype demonstrating how AI can reduce healthcare access gaps in rural India by providing fast, structured symptom triage and reliable, guideline-grounded health guidance.

---

## 📖 Overview

Rural India faces limited access to specialists and overloaded public health infrastructure. **Swasthya-Setu** is an AI-powered health assistant designed to support frontline healthcare workers and patients by offering:

1. **AI Symptom Triage**: Enter symptoms in Hindi or English and get classified into GREEN (Home Care), YELLOW (Clinic), or RED (Emergency Hospital).
2. **Medical Chatbot with RAG**: A conversational assistant grounded in WHO and Indian Public Health guidelines for trusted medical advice.
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
- **Amazon Bedrock**: 
  - `Claude 3 Haiku` for fast symptom triage
  - `Llama 3` for RAG-based chatbot responses
- **PostgreSQL + pgvector**: For document embedding retrieval and analytics (In Progress)
- AWS Lambda via **Mangum** adapter

---

## 🚀 Quick Start for the Team

### 1. Start the Backend API

The backend comes with local rule-based fallbacks, meaning **you can test the API locally without AWS credentials**.

```bash
cd backend

# Setup Python environment
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run the API server
uvicorn app.main:app --reload
```

Interactive Swagger UI docs will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

*(Note: To test the actual Bedrock AI models, add your AWS credentials into the `.env` file.)*

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The React app will be available at [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Running Tests

The backend includes a comprehensive `pytest` suite ensuring the endpoints, schemas, and local fallback engines work properly.

```bash
cd backend
pytest -v
```

---

## 📌 Implementation Checklist (Hackathon Scope)

- [x] Initial infrastructure, directory, and git scaffolding
- [x] `POST /api/v1/triage` - AI symptom classification API
- [x] `POST /api/v1/chatbot` - RAG-based AI medical chatbot API
- [x] `GET /api/v1/analytics/summary` - Usage statistics API
- [x] Frontend React + Tailwind scaffolding
- [ ] Connect Frontend React UI to Backend APIs
- [ ] Load WHO medical documents into pgvector knowledge base
- [ ] Deploy Backend to AWS Lambda
- [ ] Deploy Frontend to Amazon S3 / CloudFront

---

## 🤝 Contribution Strategy

We follow a strict Open Source PR workflow to keep the codebase clean. 
**Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide before pushing any code!** This guide covers:
- Branch naming conventions (`feat/`, `fix/`)
- Commit message guidelines
- How to open Pull Requests (PRs)
- The Phase 1, Phase 2, and Phase 3 Hackathon Checklists

*Built for the 2026 AI For Bharat Hackathon* 🇮🇳
