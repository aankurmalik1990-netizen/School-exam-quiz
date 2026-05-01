# Govt School Exam Platform – PRD

## Overview
A mobile-first PWA / Expo (iOS + Android + Web) application that allows Indian government school teachers to generate AI-powered MCQ tests (text or image input via Claude Sonnet 4.5 vision) and students to take them via a join code with anti-cheat auto-submit and one-attempt rule. Includes an admin panel for managing teachers and viewing analytics.

## Tech Stack
- **Frontend**: Expo Router (React Native + react-native-web for PWA) – Expo SDK 54
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **AI**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via `emergentintegrations` + Universal Emergent LLM key
- **Storage**: AsyncStorage (session), MongoDB (persistence)

## Roles
1. **Admin** (seeded: `admin/admin123`) – manage teachers (CRUD + enable/disable), view all student attempts, change own password, clear all data.
2. **Teacher** (created by admin) – generate questions from lesson text or image, set join code, activate test, reveal answers, view past tests with class/subject filters, see live student results.
3. **Student** (no account) – enter name + class + subject + join code → take timed test (30s/Q, auto-submit on tab-switch / time-up) → see score and per-question review → access own history.

## Key Features
- **AI question generation** via Claude Sonnet 4.5 with vision support (OCR Hindi/English textbook images).
- **One-attempt-per-test** enforced server-side (unique by name + class + joinCode).
- **Class-match validation** – Class 5 test rejects Class 6 student.
- **Anti-cheat auto-submit** – on `AppState` change, browser tab visibility change, or timer expiry.
- **Stripped questions** – student API never receives `answer` field while test is live.
- **Test history** – per-teacher (with results & avg score) and per-student (with review of own attempts).
- **PWA** – installable on home screen, offline-capable shell, branded theme.

## Backend Endpoints (`/api`)
- Admin: `POST /admin/login`, `POST /admin/password`, `GET/POST /admin/teachers`, `PUT/DELETE /admin/teachers/{id}`, `POST /admin/teachers/{id}/toggle`, `DELETE /admin/teachers/{id}/data`, `GET /admin/students`, `DELETE /admin/students/{key}`, `POST /admin/clear-all`
- Teacher: `POST /teacher/login`, `GET /teacher/public-list`, `GET /teacher/{tid}/state`, `POST /teacher/generate`, `POST /teacher/activate`, `POST /teacher/{tid}/reveal`, `GET /teacher/{tid}/history`
- Student: `POST /student/find-test`, `POST /student/submit`, `GET /student/history?name=&student_class=`

## Routes (Expo Router)
- `/` role selector
- `/admin/login`, `/admin/dashboard`
- `/teacher/login`, `/teacher/dashboard`, `/teacher/history`
- `/student/login`, `/student/test`, `/student/done`, `/student/review`, `/student/history`

## Design System
"Organic & Earthy" – Deep Forest Green (#1B4332) primary + Terracotta (#D97757) accent on warm cream (#FDFCF8) background. Outfit/Work Sans typography spirit. 44px+ touch targets, MCQ as full-width tappable cards, sticky timer pill.

## Future enhancements
- Bilingual UI toggle (Hindi/English)
- Export class results as CSV
- Question bank / re-use across tests
- Per-question time configuration
