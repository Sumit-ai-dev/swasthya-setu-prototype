# Swasthya-Setu: Offline-First AI Health Platform

## Overview

Swasthya-Setu is an offline-first, AI-powered health platform designed to eliminate geographic barriers to healthcare in rural India. By transforming every ASHA's phone into a virtual specialist, the platform delivers 30-second symptom triage, one-tap telemedicine, and real-time Indian Sign Language translation—all on an ₹8,000 device with zero internet dependency.

**Target Impact**: Reduce preventable rural mortality by 4.4x, provide specialist access to 900 million citizens, and enable healthcare for 16 crore deaf Indians.

---

## Problem Statement

### The Distance Penalty
- 50km distance from care increases mortality risk by 4.4x
- 100km distance increases it to 16.1x
- Over 50,000 preventable deaths annually

### The Specialist Drought
- 66-87% of specialist posts in rural areas are vacant
- Melghat: 1 pediatrician for 3 lakh population
- Kangra: 1 hospital for 7 lakh patients

### Systemic Invisibility
- No central database to track vacancies, beds, or equipment
- Health crises impossible to manage effectively

### The Communication Barrier
- 16 crore deaf Indians have no healthcare access
- Zero ISL (Indian Sign Language) interpreters in healthcare

---

## Solution: Four Core Pillars

### 1. Symptom Triage (30 seconds, offline)
- ASHA opens app, speaks or types symptoms in local language
- On-device AI triages in 30 seconds
- Output: Green (home care), Yellow (pharmacy), Red (specialist)
- Eliminates 4.4x mortality risk from distance

### 2. Indian Sign Language Recognition (Real-time, on-device)
- Deaf patient signs symptoms
- MediaPipe + Transformer AI converts sign to text in real-time
- Same triage engine processes the input
- Doctor's advice rendered back in ISL video
- First-ever healthcare ISL model deployed on-device

### 3. Telemedicine Integration (One-tap, eSanjeevani)
- Red cases auto-book eSanjeevani teleconsultation
- Patient stays in village, specialist appears on screen
- Prescription pushed to ABDM Health ID
- Amplifies government infrastructure

### 4. Real-time Dashboard (Transparency)
- District administrators see live vacancies, outbreaks, bed availability
- First-ever visibility into rural health crisis
- Data-driven decision making

---

## Technical Architecture

### On-Device Components
- **Symptom NLP**: DistilBERT (fine-tuned on 10,000 Indian medical conversations)
- **ISL Recognition**: MediaPipe Holistic + Transformer (543 keypoints, 30 FPS)
- **Health Chatbot**: RAG + Llama 3 (4-bit quantized, on-device)
- **Triage Engine**: Rule-based + ML confidence scoring

### Cloud Integration
- **eSanjeevani**: National telemedicine platform
- **ABDM**: Ayushman Bharat Health ID
- **Bhashini**: Government AI translation (22 languages)

### Deployment Channels
- Mobile App (Android)
- WhatsApp Bot
- IVR (Voice)
- SMS
- Web Dashboard (Admin)

---

## Tech Stack

### Frontend
- React / React Native
- Tailwind CSS
- Redux for state management

### Backend
- Python 3.11+
- FastAPI
- PostgreSQL + SQLite
- pgvector for embeddings

### ML/AI
- TensorFlow Lite (on-device models)
- DistilBERT (NLP)
- MediaPipe (CV)
- Llama 3 (LLM)

### Infrastructure
- AWS (EC2, RDS, S3)
- Docker & Kubernetes
- GitHub Actions (CI/CD)

---

## Project Structure

```
swasthya-setu-prototype/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docs/
│   ├── requirements.md
│   ├── design.md
│   └── API.md
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/swasthya-setu-prototype.git
cd swasthya-setu-prototype
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Using Docker Compose**
```bash
docker-compose up -d
```

---

## API Endpoints

### Symptom Triage
```
POST /api/v1/triage
{
  "symptoms": ["fever", "cough"],
  "language": "hi",
  "is_deaf": false
}
```

### Health Chatbot
```
POST /api/v1/chatbot
{
  "question": "What should I eat during fever?",
  "language": "hi",
  "context": "fever"
}
```

### Telemedicine Booking
```
POST /api/v1/telemedicine/book
{
  "patient_id": "uuid",
  "specialist_type": "general",
  "preferred_time": "2026-02-26T10:00:00Z"
}
```

---

## Features (MVP)

- ✅ Multi-language symptom input (Hindi, English, Tamil)
- ✅ AI-powered triage (Green/Yellow/Red)
- ✅ Health chatbot with RAG
- ✅ Basic telemedicine integration
- ✅ Admin dashboard (basic)
- 🔄 ISL recognition (Phase 2)
- 🔄 Full ABDM integration (Phase 2)

---

## Deployment

### AWS Deployment
```bash
# Build Docker images
docker build -t swasthya-setu-backend ./backend
docker build -t swasthya-setu-frontend ./frontend

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag swasthya-setu-backend:latest YOUR_ECR_URI/swasthya-setu-backend:latest
docker push YOUR_ECR_URI/swasthya-setu-backend:latest
```

### Live Demo
- **Frontend**: [Your deployed URL]
- **API Docs**: [Your API docs URL]

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Symptom Triage Time | <30 seconds |
| Triage Accuracy | >90% |
| System Uptime | 99.9% |
| Concurrent Users | 1,000+ |
| Languages Supported | 22+ |

---

## Team

- **Team Leader**: Sumit Das
- **Hackathon**: AI for Bharat 2026
- **Phase**: Prototype Development (7 days)

---


## Documentation

- [Requirements Document](./docs/requirements.md)
- [Design Document](./docs/design.md)
- [API Documentation](./docs/API.md)

---

## License

MIT License - See LICENSE file for details

---

## Contact & Support

For technical queries, reach out to our mentors on Discord or create an issue in this repository.

---

**Built with ❤️ for rural India**
