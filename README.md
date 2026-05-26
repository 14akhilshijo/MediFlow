# MediFlow – Smart Healthcare Management Platform

A modern full-stack MERN application for managing hospital operations, patient appointments, doctor profiles, and admin workflows.

## Project Structure

```
MediFlow/
├── client/          # Patient-facing React frontend
├── admin/           # Admin dashboard React frontend
└── server/          # Node.js + Express REST API backend
```

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens) + bcryptjs
- **File Uploads**: Cloudinary + Multer
- **Validation**: express-validator

## Getting Started

### 1. Clone & Install

```bash
# Backend
cd server && npm install

# Patient Frontend
cd client && npm install

# Admin Frontend
cd admin && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the `server/` folder and fill in your values.

### 3. Run Development Servers

```bash
# Backend (port 5000)
cd server && npm run dev

# Patient Frontend (port 5173)
cd client && npm run dev

# Admin Frontend (port 5174)
cd admin && npm run dev
```

## API Base URL

`http://localhost:5000/api/v1`

## Portals

| Portal  | URL                        | Description              |
|---------|----------------------------|--------------------------|
| Patient | http://localhost:5173      | Patient-facing portal    |
| Admin   | http://localhost:5174      | Admin & doctor dashboard |
| API     | http://localhost:5000      | REST API server          |
