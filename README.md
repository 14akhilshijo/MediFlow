<div align="center">

# 🏥 MediFlow

**A full-stack healthcare management system for patients, doctors, and administrators.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

MediFlow is a production-ready healthcare management platform built as a monorepo with three independent applications:

- **Patient Portal** — lets patients browse doctors, book appointments, and manage their medical records.
- **Admin Dashboard** — gives hospital administrators full control over doctors, appointments, departments, users, and analytics.
- **REST API** — a secure Node.js/Express backend powering both frontends, backed by MongoDB Atlas and Cloudinary.

The system supports role-based access control (Patient, Doctor, Admin), JWT authentication via HTTP-only cookies, real-time slot availability checking, file uploads to Cloudinary, and rich analytics visualizations.

---

## Features

### Patient Portal
- **Doctor Discovery** — Browse and search verified doctors, filter by specialization, view detailed profiles with ratings and consultation fees.
- **Appointment Booking** — 3-step wizard: select doctor → pick date & available time slot → confirm with visit reason and appointment type (In-Person / Video / Phone).
- **Appointment Management** — View all appointments with status tabs (Pending / Confirmed / Completed / Cancelled), cancel upcoming appointments, view doctor notes and prescriptions on completed visits.
- **Medical Reports** — Upload reports (PDF, JPEG, PNG, WebP, GIF — up to 10 MB) with drag-and-drop, categorize them (Lab Report / Radiology / Prescription / Discharge Summary), and view or delete them anytime.
- **Patient Dashboard** — At-a-glance stats, upcoming appointments, and quick-action links.
- **Profile Management** — Update personal information and change password.
- **Dark Mode** — System-aware theme toggle persisted across sessions.

### Admin Dashboard
- **Analytics Overview** — Animated KPI cards, monthly appointment trend (AreaChart), status breakdown (PieChart), department distribution (BarChart), patient growth (BarChart), and top doctors table — all powered by a dedicated analytics API.
- **Doctor Management** — Add, edit, verify/unverify, and delete doctors; manage availability slots; upload doctor avatars.
- **Appointment Management** — View all appointments, update statuses (Confirmed / Completed / No-Show / Cancelled), and inspect full appointment details.
- **Department Management** — Full CRUD for hospital departments.
- **User Management** — List all patients, deactivate or permanently delete accounts.
- **Medical Reports** — View and manage all patient-uploaded reports, filter by patient.
- **Messages** — Read contact form submissions, mark as read, delete.
- **Notifications** — Per-user notification feed with read/unread tracking.

### Security & Infrastructure
- JWT authentication with HTTP-only cookies (no localStorage token exposure).
- Role-based route protection on both frontend and backend.
- Input validation via `express-validator` on all mutation endpoints.
- Cloudinary for scalable, CDN-backed file storage.
- CORS whitelist restricted to known frontend origins.
- Global error handler with custom `AppError` class for consistent error responses.

---

## Tech Stack

### Backend
| Layer | Technology |
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
| Layer | Technology |
|---|---|
| UI Library | React 18 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 + PostCSS |
| HTTP Client | Axios |
| Notifications | `react-hot-toast` |
| Icons | `react-icons` |
| Charts (Admin) | Recharts 2 (AreaChart, BarChart, PieChart) |
| Build Tool | Vite 6 |

---

## Architecture

MediFlow is structured as a monorepo with three independently deployable applications.

```
MediFlow/
├── server/          # Node.js/Express REST API
│   ├── controllers/ # Route handler logic
│   ├── models/      # Mongoose schemas (User, Doctor, Appointment, …)
│   ├── routes/      # Express routers
│   ├── middlewares/ # Auth, error handling, request logging
│   ├── utils/       # AppError, helpers
│   ├── app.js       # Express app setup (CORS, routes, middleware)
│   └── server.js    # Entry point (DB connect, listen)
│
├── client/          # Patient-facing React SPA
│   └── src/
│       ├── pages/   # Home, Doctors, BookAppointment, MyReports, …
│       ├── components/
│       ├── context/ # AuthContext, ThemeContext
│       └── hooks/   # useFetch, useForm
│
└── admin/           # Admin React SPA
    └── src/
        ├── pages/   # Dashboard, Doctors, Appointments, Reports, …
        ├── components/
        ├── context/ # AdminAuthContext, ThemeContext
        └── services/# adminApi.js (Axios instance + all API calls)
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

Both frontends share the same API base path (`/api/v1`). In development, Vite's proxy forwards `/api` requests to `localhost:5000`. In production, `VITE_API_URL` points to the deployed API service.

---

## Screenshots

> _Add screenshots to a `/screenshots` folder and update the paths below._

| Patient Portal | Admin Dashboard |
|---|---|
| ![Home](screenshots/home.png) | ![Dashboard](screenshots/admin-dashboard.png) |
| ![Book Appointment](screenshots/book-appointment.png) | ![Doctors](screenshots/admin-doctors.png) |
| ![My Reports](screenshots/my-reports.png) | ![Analytics](screenshots/admin-analytics.png) |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (free tier works)
- A **Cloudinary** account (free tier works)

### Installation

Clone the repository and install dependencies for all three apps:

```bash
git clone https://github.com/your-username/mediflow.git
cd mediflow

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Install admin dependencies
cd ../admin && npm install
```

### Environment Variables

#### Server — `server/.env`

Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/mediflow` |
| `JWT_SECRET_KEY` | Secret used to sign JWTs — keep this strong and private | `a_long_random_string` |
| `JWT_EXPIRES` | JWT expiry duration | `7d` |
| `COOKIE_EXPIRE` | Auth cookie expiry in days | `7` |
| `ADMIN_SECRET_KEY` | Secret required when registering an Admin account | `admin_secret` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `my_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |
| `FRONTEND_URL` | Patient portal URL (added to CORS whitelist) | `http://localhost:5173` |
| `ADMIN_URL` | Admin dashboard URL (added to CORS whitelist) | `http://localhost:5174` |

#### Client — `client/.env`

```bash
# Only needed in production. Vite's proxy handles this in development.
VITE_API_URL=https://mediflow-api.onrender.com
```

#### Admin — `admin/.env`

```bash
# Only needed in production.
VITE_API_URL=https://mediflow-api.onrender.com
```

### Running Locally

Open three terminal windows and run each app:

```bash
# Terminal 1 — API server (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Patient portal (http://localhost:5173)
cd client
npm run dev

# Terminal 3 — Admin dashboard (http://localhost:5174)
cd admin
npm run dev
```

The API health check is available at `http://localhost:5000/health`.

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register/patient` | Public | Register a new patient account |
| `POST` | `/register/admin` | Public + secret key | Register an admin account |
| `POST` | `/login` | Public | Login (all roles); sets HTTP-only cookie |
| `GET` | `/logout` | Protected | Clear auth cookie |
| `GET` | `/me` | Protected | Get current authenticated user |
| `PATCH` | `/update-password` | Protected | Change own password |
| `POST` | `/forgot-password` | Public | Request a password reset token |
| `PATCH` | `/reset-password/:token` | Public | Reset password using token |

### Users — `/api/v1/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Admin | List all users |
| `GET` | `/:id` | Admin | Get user by ID |
| `PATCH` | `/profile` | Any auth | Update own profile |
| `PATCH` | `/:id/deactivate` | Admin | Deactivate a user account |
| `DELETE` | `/:id` | Admin | Permanently delete a user |

### Doctors — `/api/v1/doctors`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | List verified doctors (paginated, filterable) |
| `GET` | `/:id` | Public | Get a single doctor's profile |
| `POST` | `/` | Admin | Add a new doctor |
| `PATCH` | `/:id` | Admin / Doctor | Update doctor profile |
| `PATCH` | `/:id/availability` | Admin / Doctor | Update availability slots |
| `PATCH` | `/:id/verify` | Admin | Verify or unverify a doctor |
| `DELETE` | `/:id` | Admin | Delete a doctor |
| `GET` | `/admin/stats` | Admin | Aggregate doctor statistics |

### Appointments — `/api/v1/appointments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/slots` | Public | Get booked slots for a doctor on a given date |
| `POST` | `/` | Patient | Book a new appointment |
| `GET` | `/` | Admin | Get all appointments |
| `GET` | `/my` | Patient | Get own appointments |
| `GET` | `/doctor` | Doctor | Get appointments for the authenticated doctor |
| `GET` | `/stats` | Admin | Appointment statistics for the dashboard |
| `PATCH` | `/:id/status` | Admin / Doctor | Update appointment status |
| `PATCH` | `/:id/cancel` | Patient | Cancel an appointment |

### Messages — `/api/v1/messages`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Public | Submit a contact form message |
| `GET` | `/` | Admin | Get all messages |
| `PATCH` | `/:id/read` | Admin | Mark a message as read |
| `DELETE` | `/:id` | Admin | Delete a message |

### Departments — `/api/v1/departments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all departments |
| `POST` | `/` | Admin | Create a department |
| `PATCH` | `/:id` | Admin | Update a department |
| `DELETE` | `/:id` | Admin | Delete a department |

### Medical Reports — `/api/v1/reports`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Patient | Upload a medical report (stored on Cloudinary) |
| `GET` | `/my` | Patient | Get own reports (filterable by category) |
| `GET` | `/` | Admin | Get all reports |
| `GET` | `/stats` | Admin | Report statistics |
| `GET` | `/patient/:id` | Admin / Doctor | Get reports for a specific patient |
| `GET` | `/:id` | Patient / Admin / Doctor | Get a single report |
| `DELETE` | `/:id` | Patient (own) / Admin | Delete a report |

### Analytics — `/api/v1/analytics` _(Admin only)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/overview` | KPI summary with month-over-month changes |
| `GET` | `/monthly` | Monthly appointment trend (last 12 months) |
| `GET` | `/status` | Appointment status breakdown with percentages |
| `GET` | `/departments` | Appointments per department (top 8) |
| `GET` | `/top-doctors` | Top 5 doctors by appointment count |
| `GET` | `/patient-growth` | Monthly new patient registrations (last 6 months) |

### Notifications — `/api/v1/notifications` _(Any authenticated user)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get own notifications |
| `GET` | `/unread-count` | Get unread notification count |
| `PATCH` | `/read-all` | Mark all notifications as read |
| `PATCH` | `/:id/read` | Mark a single notification as read |
| `DELETE` | `/` | Clear all notifications |
| `DELETE` | `/:id` | Delete a single notification |

### Health Check

```
GET /health
```

Returns service name, environment, and current timestamp. No authentication required.

---

## Deployment

MediFlow ships with a `render.yaml` Blueprint for one-click deployment to [Render.com](https://render.com).

### Deploy to Render (Recommended)

1. Fork this repository.
2. Go to your [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect your forked repository. Render will detect `render.yaml` and create all three services automatically.
4. In the Render dashboard, set the following environment variables manually for each service (they are marked `sync: false` in the blueprint for security):

**`mediflow-api` (backend):**
- `MONGO_URI`
- `JWT_SECRET_KEY`
- `ADMIN_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL` — URL of the deployed `mediflow-client` service
- `ADMIN_URL` — URL of the deployed `mediflow-admin` service

**`mediflow-client` and `mediflow-admin` (frontends):**
- `VITE_API_URL` — URL of the deployed `mediflow-api` service

5. Trigger a deploy. All three services will build and go live.

### Manual Deployment

You can deploy each app independently to any platform:

**Backend** — any Node.js host (Render, Railway, Fly.io, AWS EC2, etc.)
```bash
cd server
npm install
npm start
```

**Client & Admin** — any static host (Netlify, Vercel, Render Static, GitHub Pages, etc.)
```bash
# Build
cd client && npm run build   # outputs to client/dist
cd admin  && npm run build   # outputs to admin/dist

# Deploy the dist/ folder to your static host
```

Both static apps include a `public/_redirects` file for SPA routing on Netlify. For other hosts, configure a rewrite rule: `/* → /index.html`.

---

## Future Enhancements

- **Real-time notifications** via WebSockets or Server-Sent Events (currently polling-based).
- **Video consultations** — integrate a WebRTC solution (e.g., Daily.co, Twilio Video) for in-app video appointments.
- **Email notifications** — send appointment confirmations, reminders, and password reset emails via Nodemailer or SendGrid.
- **Doctor self-registration** — allow doctors to apply and go through an admin approval workflow.
- **Prescription management** — structured prescription creation with medication, dosage, and duration fields.
- **Payment integration** — Stripe or Razorpay for online consultation fee collection.
- **Mobile app** — React Native client sharing the same API.
- **Two-factor authentication** — TOTP-based 2FA for admin accounts.
- **Audit logs** — track all admin actions for compliance and accountability.
- **Rate limiting** — add `express-rate-limit` to protect public endpoints from abuse.
- **Test suite** — unit and integration tests with Jest/Vitest and Supertest.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`.

Please keep PRs focused and include a clear description of what was changed and why.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/your-username">Your Name</a>
</div>
