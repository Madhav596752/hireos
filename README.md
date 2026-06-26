# HireOS — AI-Powered Recruitment Platform

> An intelligent recruitment management system built with React, Node.js, and Groq AI (LLaMA 3.3 70B) that automates resume screening, candidate tracking, and hiring pipeline management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role-Based Access Control](#role-based-access-control)
- [AI Screening](#ai-screening)
- [Screenshots](#screenshots)

---

## Overview

HireOS is a full-stack AI recruitment platform designed to streamline the hiring process for HR teams. It provides tools to manage job postings, track candidates through a hiring pipeline, and automatically screen resumes using large language models — reducing manual effort by up to 60%.

Built as an internship project at **Adeptia**, the platform demonstrates real-world integration of modern web technologies with AI/ML capabilities.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | JWT-based login/signup with role-based access (Admin, HR, Recruiter) |
| 📋 Job Management | Create, update, and manage job postings with status tracking |
| 👥 Candidate Tracking | Add candidates and move them through hiring stages (New → Hired) |
| 🤖 AI Resume Screening | Groq LLaMA 3.3 70B analyzes resumes and generates match scores |
| 📊 Dashboard | Real-time stats — total candidates, open jobs, hiring funnel |
| 💬 Messaging | Internal messaging between HR team members |
| 📅 Interview Scheduler | Schedule and manage interviews with candidates |
| ☁️ File Storage | Resume uploads via Cloudinary |
| 🛡️ Security | Helmet, CORS, rate limiting, bcrypt password hashing |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Tailwind CSS | Styling |
| React Router | Client-side routing |
| Axios | HTTP client |
| shadcn/ui | UI components |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Server framework |
| Prisma ORM | Database ORM |
| PostgreSQL (Neon) | Primary database |
| JWT | Authentication tokens |
| Groq API (LLaMA 3.3 70B) | AI resume screening |
| Cloudinary | Resume/file storage |
| Nodemailer | Email notifications |
| Redis (optional) | Caching |

---

## Project Structure

```
recruitment_portal_f/
├── hireos-backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models
│   │   └── seed.js                # Seed data
│   ├── src/
│   │   ├── app.js                 # Express app entry point
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client with reconnect logic
│   │   │   ├── cloudinary.js      # Cloudinary config
│   │   │   └── redis.js           # Redis config
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authentication middleware
│   │   │   └── rbac.js            # Role-based access control
│   │   └── modules/
│   │       ├── auth/              # Login, signup, profile
│   │       ├── jobs/              # Job CRUD operations
│   │       ├── candidates/        # Candidate management
│   │       ├── screening/         # AI resume screening (Groq)
│   │       ├── messages/          # Internal messaging
│   │       └── dashboard/         # Stats and analytics
│   └── package.json
│
└── hireos-frontend/
    ├── src/
    │   ├── api/                   # Axios API calls
    │   ├── components/            # Reusable UI components
    │   │   ├── layout/            # Sidebar, TopBar, Navigation
    │   │   └── ui/                # shadcn/ui components
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/                 # Route-level page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Jobs.jsx
    │   │   ├── Candidates.jsx
    │   │   ├── ResumeScreening.jsx
    │   │   ├── Scheduler.jsx
    │   │   └── Messages.jsx
    │   └── App.jsx
    └── package.json
```

---

## Database Schema

```
User ─────────────────────────────────────
  id, name, email, password, role
  role: ADMIN | HR | RECRUITER

Job ──────────────────────────────────────
  id, title, department, location, type
  status: OPEN | PAUSED | CLOSED | DRAFT
  ownerId → User

Candidate ────────────────────────────────
  id, name, email, phone, location
  stage: NEW | SCREENED | INTERVIEW | OFFER | HIRED | REJECTED
  score (0-100), skills[], resumeUrl
  jobId → Job

Screening ────────────────────────────────
  id, matchScore, insights (JSON)
  parsedData (JSON), interviewQs[]
  candidateId → Candidate

Interview ────────────────────────────────
  id, title, date, duration, type
  status: scheduled | completed | cancelled
  candidateId → Candidate

Message ──────────────────────────────────
  id, content, read
  senderId → User, receiverId → User
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v8 or higher
- PostgreSQL database (Neon free tier recommended)
- Groq API key — [console.groq.com](https://console.groq.com)
- Cloudinary account — [cloudinary.com](https://cloudinary.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Madhav596752/hireos.git
cd hireos
```

### 2. Backend Setup

```bash
cd hireos-backend

# Install dependencies
npm install --legacy-peer-deps
npm install nodemailer --legacy--peer-deps

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed sample data
node prisma/seed.js

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd hireos-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

Create a `.env` file inside `hireos-backend/` with the following:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/dbname?sslmode=require&connection_limit=5&pool_timeout=30&connect_timeout=30"

# JWT Authentication
JWT_SECRET="your_strong_secret_key"
JWT_EXPIRES_IN="7d"

# Groq AI
GROQ_API_KEY="gsk_your_groq_api_key"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
EMAIL_ENABLED="false"

# Redis (optional)
REDIS_ENABLED="false"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

Create a `.env` file inside `hireos-frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

---

## API Reference

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/me` | Get current user profile | All roles |

### Jobs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | List all jobs | All roles |
| GET | `/api/jobs/:id` | Get job details | All roles |
| POST | `/api/jobs` | Create new job | HR, Admin |
| PATCH | `/api/jobs/:id` | Update job | HR, Admin |
| DELETE | `/api/jobs/:id` | Delete job | Admin only |

### Candidates
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/candidates` | List all candidates | All roles |
| GET | `/api/candidates/:id` | Get candidate profile | All roles |
| POST | `/api/candidates` | Add new candidate | All roles |
| PATCH | `/api/candidates/:id` | Update candidate | All roles |
| PATCH | `/api/candidates/:id/stage` | Update hiring stage | All roles |
| DELETE | `/api/candidates/:id` | Delete candidate | HR, Admin |

### AI Screening
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/screening/screen` | Screen a resume with AI | All roles |
| GET | `/api/screening/:candidateId` | Get screening results | All roles |
| POST | `/api/screening/questions` | Generate interview questions | All roles |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Get hiring pipeline stats | All roles |

### Messages
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/messages` | Get conversations | All roles |
| POST | `/api/messages` | Send a message | All roles |

---

## Role-Based Access Control

| Feature | Admin | HR | Recruiter |
|---------|-------|----|-----------|
| View jobs & candidates | ✅ | ✅ | ✅ |
| Create candidates | ✅ | ✅ | ✅ |
| Create/edit jobs | ✅ | ✅ | ❌ |
| Delete candidates | ✅ | ✅ | ❌ |
| Delete jobs | ✅ | ❌ | ❌ |
| View dashboard | ✅ | ✅ | ✅ |
| AI screening | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |

---

## AI Screening

The screening module uses **Groq API with LLaMA 3.3 70B Versatile** model to analyze resumes.

### How It Works

1. User uploads a PDF resume or pastes resume text
2. Backend extracts text from PDF using `pdf-parse`
3. Resume text + job description are sent to Groq LLaMA
4. AI returns structured JSON with:
   - **Match Score** (0–100)
   - **Parsed candidate data** (name, skills, experience, education)
   - **Insights** (skill match, seniority, culture signals, risk flags)
   - **5 tailored interview questions**
5. Results are saved to database and candidate score is updated

### Sample AI Response

```json
{
  "matchScore": 82,
  "parsedData": {
    "name": "Rahul Sharma",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "summary": "Full Stack Developer with 3 years experience..."
  },
  "insights": [
    { "label": "Skill match", "score": 85, "note": "Strong React and Node.js alignment" },
    { "label": "Seniority", "score": 78, "note": "Mid-level experience matches role" }
  ],
  "interviewQuestions": [
    "Describe your experience with PostgreSQL query optimization.",
    "How have you implemented JWT authentication in Node.js?"
  ]
}
```

---

## Available Scripts

### Backend
```bash
npm run dev          # Start development server (nodemon)
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio (visual DB editor)
node prisma/seed.js  # Seed sample data
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Netlify | `https://hireos.netlify.app` |
| Backend | Render | `https://hireos-backend.onrender.com` |
| Database | Neon | PostgreSQL cloud |
| Files | Cloudinary | Resume storage |

---

## Developer

**Madhav**
B.Tech CSE (AI & Data Analytics) — GLA University, Mathura
Intern @ Adeptia

GitHub: [github.com/Madhav596752](https://github.com/Madhav596752)

---

*Built with ❤️ as part of Adeptia internship project — 2026*
