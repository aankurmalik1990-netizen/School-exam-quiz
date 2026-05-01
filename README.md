# 🏫 Govt School Exam Platform

AI-powered MCQ test platform for Indian government schools. Teachers generate questions from lesson text or images using Gemini 2.5 Flash, students join via secret code and take timed tests with anti-cheat protection.

**Built with**: FastAPI · MongoDB · Expo (React Native + Web PWA) · Google Gemini

## 🎯 Features

- 🛡️ **Admin** — manage teachers (CRUD + enable/disable), view all student attempts, change admin password
- 👩‍🏫 **Teacher** — generate AI MCQs from text OR image (Hindi/English, Easy/Medium/Hard), set join code, activate test, lock/reveal answers, view test history
- 🎓 **Student** — join with name + class + subject + code, take timed test (30s/Q), one attempt only, anti-cheat auto-submit on tab-switch
- 📱 **PWA** — installable on Android/iOS home screen, no Play Store needed
- 🌐 **Bilingual** — questions can be generated in English or हिंदी (Devanagari)
- 🎚️ **Difficulty levels** — L1 (recall) / L2 (understanding) / L3 (application)

## 🚀 Deploy for Free

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a complete step-by-step guide using GitHub + Render + MongoDB Atlas + Vercel — all free tiers, no credit card needed.

## 🛠️ Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and Yarn
- MongoDB (local or Atlas)
- Gemini API key from https://aistudio.google.com/apikey

### Backend
```bash
cd backend
cp .env.example .env
# edit .env and add MONGO_URL, GEMINI_API_KEY
pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd frontend
cp .env.example .env
# edit .env: EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
yarn install
yarn web        # opens http://localhost:8081
```

## 🔐 Default Admin
- Password: **`admin123`** — change immediately after first login!

## 📁 Project Structure
```
backend/         FastAPI server (server.py is the whole app)
frontend/        Expo Router app
   app/          screens (file-based routing)
   src/          shared theme, api client, UI components
memory/          PRD and test credentials docs
DEPLOYMENT.md    self-hosted deployment guide
```

## 📜 License
MIT — feel free to fork and adapt for your school.
