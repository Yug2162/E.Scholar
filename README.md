# E.Scholar 🎓

> Learn. Build. Get Certified.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Status](https://img.shields.io/badge/status-live-success)](https://escholar.vercel.app)

**[Live Demo](https://e-scholar-ten.vercel.app)**

---

## Overview

E.Scholar is a full-stack EdTech platform built on the MERN stack with three distinct user roles, OTP-verified signup, video course delivery, and auto-generated PDF certificates on course completion.

Not a tutorial clone — every architectural decision was made from scratch including RBAC middleware, Brevo HTTP API migration, on-demand Puppeteer PDF rendering, and a retrieval-augmented AI Q&A service for course content.

---

## Original Features

| Feature | Detail |
|---|---|
| 🔐 OTP Auth | Email verification via Brevo HTTP API |
| 🛡️ RBAC | Role guards at middleware level, not controller level |
| 📄 PDF Certificates | Auto-issued on 100% completion, rendered by Puppeteer |
| 🔍 Public Verification | Every certificate verifiable by unique ID |
| 📊 Analytics Dashboard | Enrollment + revenue charts via Recharts |
| ✅ Integration Tests | 19 tests across auth, courses, certificates |
| ✨ AI Course Description | Auto-generates course descriptions via Groq (Llama 3) based on title + tags |
| 🤖 Ask a Doubt | Students ask natural-language questions about a course and get instant, context-grounded answers from a dedicated RAG microservice (Netra AI) |

---

## Role Matrix

| Action | Student | Instructor | Admin |
|---|---|---|---|
| Browse courses | ✅ | ✅ | ✅ |
| Enroll | ✅ | ❌ | ❌ |
| Ask a Doubt (AI Q&A) | ✅ | ❌ | ❌ |
| Create courses | ❌ | ✅ | ❌ |
| Manage categories | ❌ | ❌ | ✅ |
| Download certificate | ✅ | ❌ | ❌ |
| View analytics | ❌ | ✅ | ✅ |

---

## Tech Stack

`React` `Redux Toolkit` `Tailwind CSS` `Node.js` `Express` `MongoDB` `Mongoose` `JWT` `bcrypt` `Brevo` `Cloudinary` `Puppeteer` `Recharts` `Jest` `Supertest` `Groq (Llama 3)` `LangChain` `FAISS`

---

## Architecture

```
┌───────────┐   ┌────────────┐   ┌───────────┐
│  Student  │   │ Instructor │   │   Admin   │
└─────┬─────┘   └─────┬──────┘   └─────┬─────┘
      │               │                │
      └───────────────┼────────────────┘
                       ▼
           ┌───────────────────────┐
           │     React Frontend    │
           │   Tailwind + Redux    │
           └───────────┬───────────┘
                       │  REST API
                       ▼
           ┌───────────────────────┐
           │    Express Backend    │
           ├───────────────────────┤
           │  JWT Auth Middleware  │
           │  RBAC Role Guards     │
           │  PDF Generator        │
           │  Brevo Email Service  │
           └───────────┬───────────┘
                       │
          ┌────────────┼────────────────┐
          ▼            ▼                ▼
   ┌────────────┐ ┌──────────────┐ ┌───────────────────┐
   │  MongoDB   │ │  Cloudinary  │ │   Netra AI API     │
   │ (Database) │ │(Media Storage)│ │ (LangChain + FAISS)│
   └────────────┘ └──────────────┘ │  RAG Q&A Service    │
                                    └────────────────────┘
```

The **Ask a Doubt** feature is served by **Netra AI** — a dedicated Python microservice. Course content is embedded and indexed into a FAISS vector store; student questions are matched against that index via retrieval-augmented generation and answered using Groq's Llama 3, rather than relying on the LLM's raw knowledge alone.

---

## API

📬 **API Endpoints**

```
POST   /api/v1/auth/sendotp                     → Send OTP
POST   /api/v1/auth/signup                      → Register
POST   /api/v1/auth/login                       → Login

GET    /api/v1/course/getAllCourses             → Public listing
POST   /api/v1/course/createCourse              → Instructor only
POST   /api/v1/course/generateDescription       → AI-generated description (Groq)

POST   /api/v1/profile/course-doubt             → Ask a question about a course (RAG, Netra AI)

GET    /api/v1/certificate/check/:courseId      → Check eligibility
GET    /api/v1/certificate/download/:courseId   → Download PDF
GET    /api/v1/certificate/verify/:id           → Public verify
```

---

## Tests

```bash
npm test
```

```
PASS  tests/auth.test.js
PASS  tests/course.test.js
PASS  tests/certificate.test.js

Tests: 19 passed, 19 total
```

---

## Challenges Solved

**Brevo Migration** — Nodemailer SMTP failed silently in production. Switched to Brevo HTTP API for reliable OTP delivery with proper error handling.

**RBAC at middleware level** — Role verification happens before controllers run. Unauthorized requests never reach business logic.

**PDF on demand** — Certificates render in memory via Puppeteer on each request. Zero storage cost, always fresh.

**Test isolation** — All 19 tests run against `mongodb-memory-server`. No real data touched, clean state after every test.

**AI integration without lock-in** — Used Groq's OpenAI-compatible API for fast, free-tier LLM calls instead of hardcoding to one vendor's SDK, keeping the integration swappable.

**Grounded AI answers, not hallucinations** — "Ask a Doubt" doesn't just prompt an LLM blind. Course content is chunked and embedded into a FAISS vector index, and student questions are answered using retrieval-augmented generation, so responses stay grounded in actual course material.

---

## Local Setup

```bash
cd server && npm install && npm run dev
cd ../ && npm install && npm start
```

---

## License

MIT © E.Scholar