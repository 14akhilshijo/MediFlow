<div align="center">

# 🏥 MediFlow

**A full-stack healthcare management platform for patients, doctors, and administrators.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Patient Portal](https://img.shields.io/badge/Live-Patient_Portal-2563eb?logo=netlify&logoColor=white)](https://mediflows.netlify.app)
[![Admin Dashboard](https://img.shields.io/badge/Live-Admin_Dashboard-7c3aed?logo=netlify&logoColor=white)](https://mediflow-admin.netlify.app/login)
[![API Health](https://img.shields.io/badge/API-Health_Check-16a34a?logo=render&logoColor=white)](https://mediflow-pmtt.onrender.com/health)

[Patient Portal](https://mediflows.netlify.app) · [Admin Dashboard](https://mediflow-admin.netlify.app/login) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Overview

MediFlow is a production-ready healthcare management platform structured as a monorepo with three independently deployable applications:

| App | Description | Live URL |
|---|---|---|
| **Patient Portal** | Browse doctors, book appointments, manage medical records | [mediflows.netlify.app](https://mediflows.netlify.app) |
| **Admin Dashboard** | Manage doctors, appointments, departments, users, and analytics | [mediflow-admin.netlify.app](https://mediflow-admin.netlify.app/login) |
| **REST API** | Secure Node.js/Express backend powering both frontends | [mediflow-pmtt.onrender.com](https://mediflow-pmtt.onrender.com/health) |

The system supports role-based access control across three roles — **Patient**, **Doctor**, and **Admin** — with JWT authentication via HTTP-only cookies, real-time slot availability, Cloudinary file storage, and rich analytics.

---

## Features

### Patient Portal

- **Doctor Discovery** — Browse and search verified doctors, filter by specialization, view profiles with ratings and consultation fees.
- **Appointment Booking** — 3-step wizard: select doctor → pick date and available time slot → confirm with visit reason and appointment type (In-Person / Video / Phone).
- **Appointment Management** — View all appointments with status tabs, cancel upcoming ones, and read doctor notes on completed visits.
- **Medical Reports** — Upload reports (PDF, JPEG, PNG, WebP — up to 10 MB) with drag-and-drop, categorize them, and view or delete anytime.
- **Patient Dashboard** — At-a-glance stats, upcoming appointments, and quick-action links.
- **Profile Management** — Update personal info and change password.
- **Dark Mode** — System-aware theme toggle persisted across sessions.

### Admin Dashboard

- **Analytics** — Animated KPI cards, monthly appointment trend (AreaChart), status breakdown (PieChart), department distribution (BarChart), patient growth (BarChart), and top doctors table.
- **Doctor Management** — Add, edit, verify/unverify, and delete doctors; manage availability slots; upload avatars.
- **Appointment Management** — View all appointments, update statuses (Confirmed / Completed / No-Show / Cancelled), inspect full details.
- **Department Management** — Full CRUD for hospital departments.
- **User Management** — List all patients, deactivate or permanently delete accounts.
- **Medical Reports** — View and manage all patient-uploaded reports.
- **Messages** — Read contact form submissions, mark as read, delete.
- **Notifications** — Per-user notification feed with read/unread tracking.

### Security

- JWT authentication with HTTP-only cookies.
- Role-based route protection on both frontend and backend.
- Input validation via `express-validator` on all mutation endpoints.
- CORS whitelist restricted to known frontend origins.
- Global error handler with a custom `AppError` class for consistent error responses.

---

## Tech Stack

### Backend

| | Technology |
|---|---|
| Runtime | Node.js 18+ (ES Modules) |
| Framework | Express 4 |
| Database | MongoDB Atlas via Mongoose 8 |
| Authentication | JWT (`jsonwebtoken`) + HTTP-only cookies |
| File Uploads | `express-fileupload` → Cloudinary v2 |
| Validation | `express-validator`, `validator` |
| Password Hashing | `bcryptjs` |
| Dev Server | `nodemon` |

### Frontend (Client & Admin)

| | Technology |
|---|---|
| UI Library | React 18 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 + PostCSS |
| HTTP Client | Axios |
| Notifications | `react-hot-toast` |
| Icons | `react-icons` |
| Charts (Admin only) | Recharts 2 |
| Build Tool | Vite 6 |

---

## Project Structure

```
MediFlow/
├── server/                  # Node.js / Express REST API
│   ├── controllers/         # Route handler logic
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── Department.js
│   │   ├── MedicalReport.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── routes/              # Express routers
│   ├── middlewares/         # Auth, error handling, validation, logging
│   ├── utils/               # AppError and helpers
│   ├── seeds/               # Database seed scripts
│   ├── app.js               # Express app (CORS, routes, middleware)
│   └── server.js            # Entry point (DB connect + listen)
│
├── client/                  # Patient-facing React SPA (port 5173)
│   └── src/
│       ├── pages/           # Home, Doctors, BookAppointment, MyReports, …
│       ├── components/      # Shared UI components and layout
│       ├── context/         # AuthContext, ThemeContext
│       ├── hooks/           # useFetch, useForm
│       └── services/        # api.js — Axios instance + all API calls
│
└── admin/                   # Admin React SPA (port 5174)
    └── src/
        ├── pages/           # Dashboard, Doctors, Appointments, Reports, …
        ├── components/      # Shared UI components and layout
        ├── context/         # AdminAuthContext, ThemeContext
        └── services/        # adminApi.js — Axios instance + all API calls
```

**Data flow:**

```
Browser (client / admin)
        │  HTTPS + HTTP-only cookie (JWT)
        ▼
  Express API  (/api/v1/*)
        │
        ├── MongoDB Atlas  (documents)
        └── Cloudinary     (images & files)
```

In development, Vite's proxy forwards `/api` requests to `localhost:5000`. In production, `VITE_API_URL` points to the deployed API.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (free tier works)
- A **Cloudinary** account (free tier works)

### Installation

```bash
git clone https://github.com/your-username/mediflow.git
cd mediflow

# Install dependencies for all three apps
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### Environment Variables

#### `server/.env`

Copy the example and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET_KEY` | Secret used to sign JWTs — keep this strong |
| `JWT_EXPIRES` | JWT expiry duration (e.g. `7d`) |
| `COOKIE_EXPIRE` | Auth cookie expiry in days |
| `ADMIN_SECRET_KEY` | Required when registering an Admin account |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Patient portal URL (added to CORS whitelist) |
| `ADMIN_URL` | Admin dashboard URL (added to CORS whitelist) |
| `CONTACT_PHONE` | Phone number shown on the public contact page |
| `CONTACT_EMAIL` | Email shown on the public contact page |
| `CONTACT_ADDRESS` | Address shown on the public contact page |
| `FOUNDING_YEAR` | Used to calculate "Years of Service" on the home page |

#### `client/.env` and `admin/.env`

Only needed in production. Vite's proxy handles API routing in development.

```env
VITE_API_URL=https://your-api-url.onrender.com
```

### Running Locally

Open three terminals:

```bash
# Terminal 1 — API (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Patient portal (http://localhost:5173)
cd client && npm run dev

# Terminal 3 — Admin dashboard (http://localhost:5174)
cd admin && npm run dev
```

Health check: `GET http://localhost:5000/health`

#### Seed the database (optional)

```bash
cd server

# Seed sample doctors
npm run seed:doctors

# Seed an admin account
npm run seed:admin

# Clear seeded doctors
npm run seed:doctors:clear
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register/patient` | Public | Register a patient account |
| `POST` | `/register/admin` | Public + secret key | Register an admin account |
| `POST` | `/register/doctor` | Admin | Register a doctor account |
| `POST` | `/login` | Public | Login (all roles); sets HTTP-only cookie |
| `GET` | `/logout` | Protected | Clear auth cookie |
| `GET` | `/me` | Protected | Get the current authenticated user |
| `PATCH` | `/update-password` | Protected | Change own password |
| `POST` | `/forgot-password` | Public | Request a password reset token |
| `PATCH` | `/reset-password/:token` | Public | Reset password using token |

### Users — `/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Admin | List all users |
| `GET` | `/:id` | Admin | Get user by ID |
| `PATCH` | `/profile` | Any auth | Update own profile |
| `PATCH` | `/:id/deactivate` | Admin | Deactivate a user account |
| `DELETE` | `/:id` | Admin | Permanently delete a user |

### Doctors — `/doctors`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | List verified doctors (paginated, filterable) |
| `GET` | `/:id` | Public | Get a single doctor's profile |
| `GET` | `/my-profile` | Doctor | Get the authenticated doctor's own profile |
| `GET` | `/admin/stats` | Admin | Aggregate doctor statistics |
| `POST` | `/` | Admin | Add a new doctor |
| `PATCH` | `/:id` | Admin / Doctor | Update doctor profile |
| `PATCH` | `/:id/availability` | Admin / Doctor | Update availability slots |
| `PATCH` | `/:id/verify` | Admin | Verify or unverify a doctor |
| `DELETE` | `/:id` | Admin | Delete a doctor |

### Appointments — `/appointments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/slots` | Public | Get booked slots for a doctor on a given date |
| `POST` | `/` | Patient | Book a new appointment |
| `GET` | `/` | Admin | Get all appointments |
| `GET` | `/my` | Patient | Get own appointments |
| `GET` | `/doctor` | Doctor | Get appointments for the authenticated doctor |
| `GET` | `/stats` | Admin | Appointment statistics |
| `PATCH` | `/:id/status` | Admin / Doctor | Update appointment status |
| `PATCH` | `/:id/cancel` | Patient | Cancel an appointment |

### Departments — `/departments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all departments |
| `POST` | `/` | Admin | Create a department |
| `PATCH` | `/:id` | Admin | Update a department |
| `DELETE` | `/:id` | Admin | Delete a department |

### Medical Reports — `/reports`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Patient | Upload a report (stored on Cloudinary) |
| `GET` | `/my` | Patient | Get own reports (filterable by category) |
| `GET` | `/` | Admin | Get all reports |
| `GET` | `/stats` | Admin | Report statistics |
| `GET` | `/patient/:id` | Admin / Doctor | Get reports for a specific patient |
| `GET` | `/:id` | Patient / Admin / Doctor | Get a single report |
| `DELETE` | `/:id` | Patient (own) / Admin | Delete a report |

### Messages — `/messages`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Public | Submit a contact form message |
| `GET` | `/` | Admin | Get all messages |
| `PATCH` | `/:id/read` | Admin | Mark a message as read |
| `DELETE` | `/:id` | Admin | Delete a message |

### Analytics — `/analytics` _(Admin only)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/overview` | KPI summary with month-over-month changes |
| `GET` | `/monthly` | Monthly appointment trend (last 12 months) |
| `GET` | `/status` | Appointment status breakdown with percentages |
| `GET` | `/departments` | Appointments per department (top 8) |
| `GET` | `/top-doctors` | Top 5 doctors by appointment count |
| `GET` | `/patient-growth` | Monthly new patient registrations (last 6 months) |

### Notifications — `/notifications` _(Any authenticated user)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get own notifications |
| `GET` | `/unread-count` | Get unread notification count |
| `PATCH` | `/read-all` | Mark all notifications as read |
| `PATCH` | `/:id/read` | Mark a single notification as read |
| `DELETE` | `/` | Clear all notifications |
| `DELETE` | `/:id` | Delete a single notification |

### Public — `/public` _(No auth required)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/stats` | Live platform stats (patients, doctors, appointments, years of service) |
| `GET` | `/settings` | Public contact info (phone, email, address) |

### Health Check

```
GET /health
```

Returns service name, environment, and current timestamp. No authentication required.

---

## Deployment

MediFlow ships with a `render.yaml` Blueprint for one-click deployment to [Render](https://render.com).

### Live Services

| Service | URL |
|---|---|
| Patient Portal | [mediflows.netlify.app](https://mediflows.netlify.app) |
| Admin Dashboard | [mediflow-admin.netlify.app/login](https://mediflow-admin.netlify.app/login) |
| REST API | [mediflow-pmtt.onrender.com](https://mediflow-pmtt.onrender.com/health) |

### Deploy to Render (one-click)

1. Fork this repository.
2. Go to your [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect your fork. Render detects `render.yaml` and creates all three services automatically.
4. Set the following environment variables manually in the Render dashboard (they are marked `sync: false` in the blueprint):

**`mediflow-api`:**
`MONGO_URI`, `JWT_SECRET_KEY`, `ADMIN_SECRET_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL`, `ADMIN_URL`

**`mediflow-client` and `mediflow-admin`:**
`VITE_API_URL` — set to the URL of the deployed `mediflow-api` service.

5. Trigger a deploy. All three services build and go live.

### Manual Deployment

**Backend** — any Node.js host (Render, Railway, Fly.io, etc.)

```bash
cd server
npm install
npm start
```

**Client & Admin** — any static host (Netlify, Vercel, Render Static, etc.)

```bash
cd client && npm run build   # → client/dist
cd admin  && npm run build   # → admin/dist
```

Both static apps include a `public/_redirects` file for SPA routing on Netlify. For other hosts, add a rewrite rule: `/* → /index.html`.

---

## Future Enhancements

- **Email notifications** — appointment confirmations and reminders via Nodemailer / SendGrid.
- **Real-time updates** — WebSockets or Server-Sent Events for live appointment status changes.
- **Video consultations** — WebRTC integration (Daily.co, Twilio Video) for in-app video appointments.
- **Payment integration** — Stripe or Razorpay for online consultation fee collection.
- **Doctor self-registration** — application workflow with admin approval.
- **Prescription management** — structured prescriptions with medication, dosage, and duration.
- **Rate limiting** — `express-rate-limit` on public endpoints.
- **Test suite** — unit and integration tests with Vitest and Supertest.
- **Two-factor authentication** — TOTP-based 2FA for admin accounts.
- **Mobile app** — React Native client sharing the same API.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/14akhilshijo">Akhil Shijo</a>
</div>
