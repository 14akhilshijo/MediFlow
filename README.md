<div align="center">

<img src="https://img.shields.io/badge/-%F0%9F%8F%A5%20MediFlow-0ea5e9?style=for-the-badge&labelColor=0f172a&color=0ea5e9" height="42" alt="MediFlow" />

### A production-ready, full-stack healthcare management platform

*Built for patients, doctors, and administrators — all in one place.*

<br/>

[![Patient Portal](https://img.shields.io/badge/🌐%20Patient%20Portal-Live-2563eb?style=flat-square&logo=netlify&logoColor=white)](https://mediflows.netlify.app)
[![Admin Dashboard](https://img.shields.io/badge/🛡️%20Admin%20Dashboard-Live-7c3aed?style=flat-square&logo=netlify&logoColor=white)](https://mediflow-admin.netlify.app/login)
[![API](https://img.shields.io/badge/⚡%20REST%20API-Health%20Check-16a34a?style=flat-square&logo=render&logoColor=white)](https://mediflow-pmtt.onrender.com/health)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

<br/>

> **Created & developed by [Akhil Shijo](https://akhilshijoinnov.site)**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [About the Developer](#-about-the-developer)

---

## 🏥 Overview

MediFlow is a **monorepo healthcare platform** with three independently deployable applications sharing a single REST API. It supports role-based access for **Patients**, **Doctors**, and **Admins** — covering everything from appointment booking to medical report management and real-time analytics.

The project was built end-to-end as a full-stack showcase, demonstrating real-world architecture decisions, secure authentication, cloud file storage, and a polished UI across both a patient portal and an admin dashboard.

---

## 🌐 Live Demo

| Application | URL | Credentials |
|---|---|---|
| 🩺 **Patient Portal** | [mediflows.netlify.app](https://mediflows.netlify.app) | Register a free account |
| 🛡️ **Admin Dashboard** | [mediflow-admin.netlify.app/login](https://mediflow-admin.netlify.app/login) | Contact developer |
| ⚡ **API Health** | [mediflow-pmtt.onrender.com/health](https://mediflow-pmtt.onrender.com/health) | Public |

---

## ✨ Features

<details>
<summary><strong>🩺 Patient Portal</strong></summary>

- Browse and search verified doctors — filter by specialization, view ratings and fees
- **3-step appointment booking** — select doctor → pick date & time slot → confirm with visit type (In-Person / Video / Phone)
- View, manage, and cancel appointments with status tracking
- Upload medical reports (PDF, JPEG, PNG — up to 10 MB) with drag-and-drop
- Patient dashboard with upcoming appointments and quick actions
- Profile management and password change
- Dark mode with system-aware theme toggle

</details>

<details>
<summary><strong>🛡️ Admin Dashboard</strong></summary>

- Animated KPI cards with month-over-month changes
- Charts — monthly appointment trends, status breakdown, department distribution, patient growth, top doctors
- Full doctor management — add, edit, verify, delete, manage availability slots
- Appointment management — view all, update statuses, inspect details
- Department CRUD, user management, medical report viewer
- Contact message inbox with read/unread tracking
- Per-user notification feed

</details>

<details>
<summary><strong>🔐 Security</strong></summary>

- JWT authentication via HTTP-only cookies
- Role-based route protection on both frontend and backend
- Input validation with `express-validator` on all mutation endpoints
- CORS whitelist restricted to known frontend origins
- Global error handler with a custom `AppError` class

</details>

---

## 🏗️ Architecture

```
Browser (Patient Portal / Admin Dashboard)
         │
         │  HTTPS + HTTP-only cookie (JWT)
         ▼
   Express REST API  /api/v1/*
         │
         ├──▶  MongoDB Atlas   (documents)
         └──▶  Cloudinary      (images & files)
```

**Data flow in development:**
Vite's dev proxy forwards all `/api` requests to `localhost:5000`, so no CORS issues during local development. In production, `VITE_API_URL` points to the deployed API on Render.

**Role-based access:**

| Role | Access |
|---|---|
| `Patient` | Book appointments, manage own records and reports |
| `Doctor` | View own appointments, update profile and availability |
| `Admin` | Full platform access — all users, doctors, analytics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS 3, Vite 6 |
| State / Data | Context API, custom `useFetch` hook, Axios |
| Charts | Recharts 2 (admin only) |
| Backend | Node.js 18+, Express 4 (ES Modules) |
| Database | MongoDB Atlas, Mongoose 8 |
| Auth | JWT + HTTP-only cookies, bcryptjs |
| File Uploads | express-fileupload → Cloudinary v2 |
| Validation | express-validator |
| Icons | react-icons |
| Notifications | react-hot-toast |

---

## 📁 Project Structure

```
MediFlow/
├── server/                  # Node.js / Express REST API
│   ├── controllers/         # Route handler logic
│   ├── models/              # Mongoose schemas (User, Doctor, Appointment …)
│   ├── routes/              # Express routers
│   ├── middlewares/         # Auth, validation, error handling
│   ├── utils/               # AppError, apiFeatures helpers
│   ├── seeds/               # Database seed scripts
│   ├── app.js               # Express app setup
│   └── server.js            # Entry point
│
├── client/                  # Patient portal  →  port 5173
│   └── src/
│       ├── pages/           # Home, Doctors, BookAppointment, Dashboard …
│       ├── components/      # Shared UI + layout
│       ├── context/         # AuthContext, ThemeContext
│       ├── hooks/           # useFetch, useForm
│       └── services/        # Axios instance + API calls
│
└── admin/                   # Admin dashboard  →  port 5174
    └── src/
        ├── pages/           # Dashboard, Doctors, Appointments, Reports …
        ├── components/      # Shared UI + layout
        ├── context/         # AdminAuthContext, ThemeContext
        └── services/        # Axios instance + API calls
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas cluster (free tier works)
- Cloudinary account (free tier works)

### Install

```bash
git clone https://github.com/14akhilshijo/mediflow.git
cd mediflow

cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_uri

JWT_SECRET_KEY=your_strong_jwt_secret
JWT_EXPIRES=7d
COOKIE_EXPIRE=7

ADMIN_SECRET_KEY=your_admin_registration_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

CONTACT_PHONE=+1 (800) 123-4567
CONTACT_EMAIL=support@mediflow.com
CONTACT_ADDRESS=123 Health Ave, Medical City
FOUNDING_YEAR=2020
```

### Run Locally

```bash
# Terminal 1 — API  (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Patient portal  (http://localhost:5173)
cd client && npm run dev

# Terminal 3 — Admin dashboard  (http://localhost:5174)
cd admin && npm run dev
```

### Seed the Database

```bash
cd server
npm run seed:doctors         # Add 5 sample doctors
npm run seed:admin           # Add an admin account
npm run seed:doctors:clear   # Wipe and re-seed doctors
```

---

## ☁️ Deployment

The repo ships with a `render.yaml` Blueprint for one-click deployment to [Render](https://render.com).

**Steps:**
1. Fork this repository
2. Render → New → Blueprint → connect your fork
3. Set environment variables in the Render dashboard:
   - **API:** `MONGO_URI`, `JWT_SECRET_KEY`, `ADMIN_SECRET_KEY`, Cloudinary keys, `FRONTEND_URL`, `ADMIN_URL`
   - **Client & Admin:** `VITE_API_URL` → your deployed API URL

**Build commands for static hosting (Netlify / Vercel):**

```bash
cd client && npm run build   # output → client/dist
cd admin  && npm run build   # output → admin/dist
```

Both apps include a `public/_redirects` file for SPA routing on Netlify.

---

## 👨‍💻 About the Developer

<div align="center">

**Akhil Shijo**
*Full-Stack Developer*

[![Portfolio](https://img.shields.io/badge/🌐%20Portfolio-akhilshijoinnov.site-0ea5e9?style=flat-square)](https://akhilshijoinnov.site)
[![GitHub](https://img.shields.io/badge/GitHub-14akhilshijo-181717?style=flat-square&logo=github)](https://github.com/14akhilshijo)

</div>

MediFlow was designed and built entirely by Akhil Shijo as a full-stack project demonstrating:

- **Project flow** — monorepo with three independently deployable apps sharing one API
- **Features implemented** — role-based auth, appointment booking, medical records, real-time analytics, file uploads
- **Technologies used** — React, Node.js, Express, MongoDB, Tailwind CSS, Cloudinary, JWT
- **Logic and architecture** — REST API with layered controllers/services, JWT via HTTP-only cookies, Mongoose schemas with virtuals, Vite proxy for local dev
- **Challenges faced** — managing role-based access across three user types, real-time slot availability without websockets, Cloudinary integration with multipart form data, dark mode persistence across sessions

---

<div align="center">

Built with ❤️ by **[Akhil Shijo](https://akhilshijoinnov.site)**

*MIT License*

</div>
