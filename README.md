<div align="center">

# 🏥 MediFlow

### Full-Stack Healthcare Management Platform

*A production-ready monorepo application for patients, doctors, and administrators — built as part of the Tanjer Info Systems 6-Day Build Challenge.*

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

> **Developed by [Akhil Shijo](https://akhilshijoinnov.site)** — Full-Stack Developer

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features Implemented](#-features-implemented)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Credentials](#-demo-credentials)
- [Deployment](#-deployment)
- [Challenges Faced](#-challenges-faced)
- [Learnings from the Challenge](#-learnings-from-the-challenge)
- [About the Developer](#-about-the-developer)

---

## 🏥 Overview

MediFlow is a **full-stack healthcare management platform** built as a monorepo containing three independently deployable applications — a Patient Portal, an Admin Dashboard, and a shared REST API.

The platform supports three distinct user roles:

| Role | Description |
|---|---|
| **Patient** | Browse doctors, book appointments, manage medical reports |
| **Doctor** | View appointments, manage schedule and availability |
| **Admin** | Full platform control — users, doctors, analytics, reports |

Built end-to-end in 6 days, MediFlow demonstrates real-world architecture decisions including role-based authentication, cloud file storage, analytics dashboards, and a polished responsive UI.

---

## 🌐 Live Demo

| Application | URL | Access |
|---|---|---|
| 🩺 Patient Portal | [mediflows.netlify.app](https://mediflows.netlify.app) | Register a free account |
| 🛡️ Admin Dashboard | [mediflow-admin.netlify.app/login](https://mediflow-admin.netlify.app/login) | See credentials below |
| ⚡ API Health Check | [mediflow-pmtt.onrender.com/health](https://mediflow-pmtt.onrender.com/health) | Public |

---

## ✨ Features Implemented

### 🩺 Patient Portal

- **Doctor Discovery** — Browse and search verified doctors, filter by specialization, view ratings, fees, and availability
- **3-Step Appointment Booking** — Select doctor → pick date & available time slot → confirm visit type (In-Person / Video / Phone)
- **Appointment Management** — View upcoming and past appointments, cancel with confirmation
- **Medical Reports** — Upload reports (PDF, JPEG, PNG up to 10 MB) with drag-and-drop, view and manage all uploads
- **Patient Dashboard** — Quick overview of upcoming appointments and recent activity
- **Profile Management** — Update personal details and change password
- **Dark Mode** — System-aware theme toggle with persistent preference

### 👨‍⚕️ Doctor Portal

- **Doctor Dashboard** — Overview of today's appointments and schedule
- **Appointment Viewer** — View all assigned patient appointments with status
- **Schedule Management** — Set and update weekly availability slots
- **Profile Management** — Update professional details and bio

### 🛡️ Admin Dashboard

- **Analytics Overview** — Animated KPI cards with month-over-month changes
- **Charts & Reports** — Monthly appointment trends, status breakdown, department distribution, patient growth, top doctors (Recharts)
- **Doctor Management** — Add, edit, verify, delete doctors; manage availability slots
- **Appointment Management** — View all appointments, update statuses, inspect details
- **Department CRUD** — Create, update, and delete hospital departments
- **User Management** — View and manage all registered users
- **Medical Report Viewer** — Access patient-uploaded reports
- **Contact Message Inbox** — Read/unread tracking for patient messages
- **Notification Feed** — Per-user notification system

### 🔐 Security

- JWT authentication stored in HTTP-only cookies (not localStorage)
- Role-based route protection on both frontend and backend
- Input validation with `express-validator` on all mutation endpoints
- CORS whitelist restricted to known frontend origins
- Global error handler with a custom `AppError` class
- Password hashing with `bcryptjs`

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Patient Portal    │     │   Admin Dashboard   │
│  (React + Vite)     │     │  (React + Vite)     │
│  localhost:5173     │     │  localhost:5174     │
└────────┬────────────┘     └──────────┬──────────┘
         │                             │
         │     HTTPS + HTTP-only       │
         │     Cookie (JWT)            │
         └──────────────┬──────────────┘
                        │
               ┌────────▼────────┐
               │  Express REST   │
               │  API /api/v1/*  │
               │  localhost:5000 │
               └────┬───────┬───┘
                    │       │
          ┌─────────▼─┐  ┌──▼──────────┐
          │  MongoDB  │  │  Cloudinary │
          │   Atlas   │  │  (Files)    │
          └───────────┘  └─────────────┘
```

**API Routes:**

| Prefix | Purpose |
|---|---|
| `/api/v1/auth` | Login, register, logout |
| `/api/v1/users` | User profile management |
| `/api/v1/doctors` | Doctor CRUD and availability |
| `/api/v1/appointments` | Booking and status management |
| `/api/v1/departments` | Department CRUD |
| `/api/v1/reports` | Medical report upload/retrieval |
| `/api/v1/analytics` | Dashboard statistics |
| `/api/v1/notifications` | User notification feed |
| `/api/v1/messages` | Contact form messages |
| `/api/v1/public` | Public data (no auth required) |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React, React Router | 18.3.1, 6.28.2 |
| Styling | Tailwind CSS | 3.4.17 |
| Build Tool | Vite | 6.0.7 |
| HTTP Client | Axios | 1.7.9 |
| Charts | Recharts (admin only) | 2.15.0 |
| Notifications | react-hot-toast | 2.4.1 |
| Icons | react-icons | 5.4.0 |
| Backend | Node.js, Express | 18+, 4.21.2 |
| Database | MongoDB Atlas, Mongoose | 8.9.5 |
| Authentication | JWT + HTTP-only cookies | jsonwebtoken 9.0.2 |
| Password Hashing | bcryptjs | 2.4.3 |
| File Uploads | express-fileupload → Cloudinary | 1.5.1, 2.5.1 |
| Validation | express-validator | 7.2.1 |

---

## 📁 Project Structure

```
MediFlow/
│
├── server/                        # Node.js / Express REST API
│   ├── config/                    # Database connection
│   ├── controllers/               # Route handler logic
│   │   ├── authController.js
│   │   ├── appointmentController.js
│   │   ├── doctorController.js
│   │   ├── reportController.js
│   │   ├── analyticsController.js
│   │   └── ...
│   ├── models/                    # Mongoose schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── MedicalReport.js
│   │   ├── Department.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/                    # Express routers
│   ├── middlewares/               # Auth, validation, error handling
│   ├── utils/                     # AppError, apiFeatures helpers
│   ├── seeds/                     # Database seed scripts
│   │   ├── seedAdmin.js
│   │   └── seedDoctors.js
│   ├── app.js                     # Express app setup
│   └── server.js                  # Entry point
│
├── client/                        # Patient Portal (port 5173)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Doctors.jsx
│       │   ├── DoctorDetail.jsx
│       │   ├── Departments.jsx
│       │   ├── About.jsx
│       │   ├── Contact.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── patient/           # Protected patient pages
│       │   │   ├── Dashboard.jsx
│       │   │   ├── BookAppointment.jsx
│       │   │   ├── MyAppointments.jsx
│       │   │   ├── MyReports.jsx
│       │   │   └── Profile.jsx
│       │   └── doctor/            # Protected doctor pages
│       │       ├── Dashboard.jsx
│       │       ├── Appointments.jsx
│       │       ├── Schedule.jsx
│       │       └── Profile.jsx
│       ├── components/            # Shared UI + layout
│       ├── context/               # AuthContext, ThemeContext
│       ├── hooks/                 # useFetch, useForm
│       └── services/              # Axios instance + API calls
│
└── admin/                         # Admin Dashboard (port 5174)
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Doctors.jsx
        │   ├── Appointments.jsx
        │   ├── Departments.jsx
        │   ├── Users.jsx
        │   ├── Reports.jsx
        │   ├── Messages.jsx
        │   └── AddDoctor.jsx
        ├── components/            # Shared UI + layout
        ├── context/               # AdminAuthContext, ThemeContext
        └── services/              # Axios instance + API calls
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas cluster (free tier works)
- Cloudinary account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/14akhilshijo/mediflow.git
cd mediflow
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Install admin dependencies
cd ../admin && npm install
```

### 3. Configure Environment Variables

Create `server/.env` (use `server/.env.example` as reference):

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

### 4. Seed the Database

```bash
cd server

npm run seed:admin          # Creates the admin account
npm run seed:doctors        # Adds 5 sample doctors with departments
npm run seed:doctors:clear  # Wipe and re-seed doctors (optional)
```

### 5. Run Locally

Open three terminals:

```bash
# Terminal 1 — API server (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Patient portal (http://localhost:5173)
cd client && npm run dev

# Terminal 3 — Admin dashboard (http://localhost:5174)
cd admin && npm run dev
```

---

## 🔑 Demo Credentials

### Admin Dashboard

```
Email:    admin@mediflow.com
Password: Admin@1234
```

### Doctor Accounts (login via Patient Portal)

```
Email:    arjun.mehta@mediflow.com     Password: Doctor@1234
Email:    priya.sharma@mediflow.com    Password: Doctor@1234
Email:    rajesh.kumar@mediflow.com    Password: Doctor@1234
Email:    sneha.patel@mediflow.com     Password: Doctor@1234
Email:    vikram.singh@mediflow.com    Password: Doctor@1234
```

### Patient Account

Register a free account at [mediflows.netlify.app](https://mediflows.netlify.app)

---

## ☁️ Deployment

The repo includes a `render.yaml` Blueprint for one-click API deployment to [Render](https://render.com). Both frontends are deployed on [Netlify](https://netlify.com).

### Deploy the API (Render)

1. Fork this repository
2. Render → New → Blueprint → connect your fork
3. Set all environment variables from `server/.env` in the Render dashboard

### Deploy the Frontends (Netlify / Vercel)

```bash
# Build patient portal
cd client && npm run build    # Output → client/dist

# Build admin dashboard
cd admin && npm run build     # Output → admin/dist
```

Set `VITE_API_URL` to your deployed Render API URL in each frontend's environment settings.

Both apps include `public/_redirects` for SPA routing on Netlify.

---

## 🧩 Challenges Faced

1. **Managing three user roles across one API** — Designing middleware that correctly identifies and restricts access for Patient, Doctor, and Admin roles without duplicating logic was the most complex architectural challenge. Solved by a single `protect` middleware combined with a `restrictTo(...roles)` higher-order function.

2. **Slot availability without WebSockets** — Preventing double-booking of appointment slots in real time without a WebSocket layer required careful server-side validation on every booking request, checking existing confirmed appointments against the requested slot before creating a new one.

3. **Cloudinary integration with multipart form data** — Handling file uploads through `express-fileupload` and streaming them to Cloudinary while validating file type and size on the server side required careful middleware ordering and error handling.

4. **Dark mode persistence across sessions** — Implementing a system-aware dark mode that also respects user preference stored in `localStorage`, and ensuring it applied consistently across both the client and admin apps without flash-of-wrong-theme on load.

5. **Vite proxy configuration for local development** — Configuring Vite's dev proxy to forward `/api` requests to `localhost:5000` so both frontend apps could share the same API without CORS issues during development, while still pointing to the deployed API URL in production via `VITE_API_URL`.

6. **Monorepo coordination** — Keeping three separate `package.json` files, environment configs, and build pipelines in sync while ensuring the shared API contract stayed consistent across all three apps.

---

## 📚 Learnings from the Challenge

- **Monorepo architecture** — Structuring multiple apps in a single repository with shared conventions but independent deployments gave me a much deeper understanding of how large-scale projects are organized.

- **JWT via HTTP-only cookies** — Implementing authentication with HTTP-only cookies instead of localStorage significantly improved security posture and taught me how to handle CORS with `credentials: true` correctly.

- **Role-based access control** — Designing a clean RBAC system at the middleware level, rather than scattering role checks across controllers, made the codebase far more maintainable.

- **Mongoose schema design** — Modeling relationships between Users, Doctors, Appointments, and Departments using references vs. embedded documents, and understanding when to use `.populate()` for efficient queries.

- **Cloudinary for file management** — Integrating a cloud storage provider for user-uploaded medical reports taught me how to handle binary data in a REST API and manage file lifecycle (upload, retrieve, delete).

- **Building under time pressure** — Completing a production-quality full-stack application in 6 days required prioritizing features, making quick architectural decisions, and writing clean code from the start rather than refactoring later.

- **Deployment pipeline** — Setting up separate deployment targets for API (Render) and frontends (Netlify), managing environment variables per environment, and configuring SPA routing redirects for production.

---

## 👨‍💻 About the Developer

<div align="center">

**Akhil Shijo**
*Full-Stack Developer*

[![Portfolio](https://img.shields.io/badge/🌐%20Portfolio-akhilshijoinnov.site-0ea5e9?style=flat-square)](https://akhilshijoinnov.site)
[![GitHub](https://img.shields.io/badge/GitHub-14akhilshijo-181717?style=flat-square&logo=github)](https://github.com/14akhilshijo)

</div>

MediFlow was designed and built entirely by Akhil Shijo as a 6-day full-stack challenge, demonstrating end-to-end ownership of a production-grade application — from database schema design and REST API development to responsive UI implementation and cloud deployment.

---

<div align="center">

*Built with ❤️ by **[Akhil Shijo](https://akhilshijoinnov.site)** — MIT License*

</div>
