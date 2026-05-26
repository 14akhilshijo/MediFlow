# MediFlow – Healthcare Management System

A full-stack healthcare management platform with a patient portal, admin dashboard, and REST API.

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js · Express · MongoDB Atlas · Cloudinary |
| Admin | React 18 · Vite · Tailwind CSS · Recharts |
| Client | React 18 · Vite · Tailwind CSS |
| Auth | JWT (httpOnly cookies) |

---

## Project Structure

```
MediFlow/
├── server/     # Express REST API
├── admin/      # Admin dashboard (port 5174)
└── client/     # Patient portal (port 5173)
```

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/14akhilshijo/MediFlow.git
cd MediFlow
```

### 2. Backend

```bash
cd server
cp .env.example .env      # fill in your values
npm install
npm run dev               # runs on http://localhost:5000
```

### 3. Admin Dashboard

```bash
cd admin
npm install
npm run dev               # runs on http://localhost:5174
```

### 4. Patient Client

```bash
cd client
npm install
npm run dev               # runs on http://localhost:5173
```

---

## Environment Variables

### `server/.env`

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mediflow

JWT_SECRET_KEY=your_strong_secret
JWT_EXPIRES=7d
COOKIE_EXPIRE=7

ADMIN_SECRET_KEY=your_admin_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### `client/.env` (production only)

```env
VITE_API_URL=https://mediflow-api.onrender.com
```

### `admin/.env` (production only)

```env
VITE_API_URL=https://mediflow-api.onrender.com
```

---

## Hosting Guide

### Recommended: Free Tier

| Service | What to deploy |
|---|---|
| [Render.com](https://render.com) | Backend API (Node.js web service) |
| [Netlify](https://netlify.com) | Client + Admin (static sites) |
| [MongoDB Atlas](https://cloud.mongodb.com) | Database (free M0 cluster) |
| [Cloudinary](https://cloudinary.com) | Image uploads (free tier) |

---

### Step 1 — MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free **M0** cluster
2. Create a database user (username + password)
3. Whitelist IP: `0.0.0.0/0` (allow all — required for Render)
4. Copy the connection string → `MONGO_URI`

---

### Step 2 — Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

---

### Step 3 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo: `14akhilshijo/MediFlow`
3. Settings:

   | Field | Value |
   |---|---|
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

4. Add **Environment Variables** (click "Add Environment Variable" for each):

   ```
   NODE_ENV          = production
   PORT              = 5000
   MONGO_URI         = mongodb+srv://...
   JWT_SECRET_KEY    = <strong random string>
   JWT_EXPIRES       = 7d
   COOKIE_EXPIRE     = 7
   ADMIN_SECRET_KEY  = <strong random string>
   CLOUDINARY_CLOUD_NAME = ...
   CLOUDINARY_API_KEY    = ...
   CLOUDINARY_API_SECRET = ...
   FRONTEND_URL      = https://mediflow-client.netlify.app
   ADMIN_URL         = https://mediflow-admin.netlify.app
   ```

5. Click **Deploy** → copy the URL (e.g. `https://mediflow-api.onrender.com`)

---

### Step 4 — Deploy Client on Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Connect `14akhilshijo/MediFlow`
3. Settings:

   | Field | Value |
   |---|---|
   | **Base directory** | `client` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `client/dist` |

4. **Site settings → Environment variables → Add**:

   ```
   VITE_API_URL = https://mediflow-api.onrender.com
   ```

5. Deploy → copy the URL (e.g. `https://mediflow-client.netlify.app`)

---

### Step 5 — Deploy Admin on Netlify

1. **Add new site → Import from Git** (same repo, different config)
2. Settings:

   | Field | Value |
   |---|---|
   | **Base directory** | `admin` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `admin/dist` |

3. **Environment variables**:

   ```
   VITE_API_URL = https://mediflow-api.onrender.com
   ```

4. Deploy → copy the URL (e.g. `https://mediflow-admin.netlify.app`)

---

### Step 6 — Update CORS on Render

Go back to your Render backend service → **Environment** → update:

```
FRONTEND_URL = https://mediflow-client.netlify.app
ADMIN_URL    = https://mediflow-admin.netlify.app
```

Render will auto-redeploy.

---

## API Endpoints

```
POST   /api/v1/auth/register/patient
POST   /api/v1/auth/register/admin
POST   /api/v1/auth/login
GET    /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/doctors
GET    /api/v1/doctors/:id
POST   /api/v1/doctors              [Admin]
PATCH  /api/v1/doctors/:id          [Admin/Doctor]
PATCH  /api/v1/doctors/:id/verify   [Admin]
DELETE /api/v1/doctors/:id          [Admin]

GET    /api/v1/appointments         [Admin]
POST   /api/v1/appointments         [Patient]
GET    /api/v1/appointments/my      [Patient]
GET    /api/v1/appointments/stats   [Admin]
PATCH  /api/v1/appointments/:id/status  [Admin/Doctor]

GET    /api/v1/departments
POST   /api/v1/departments          [Admin]

GET    /api/v1/messages             [Admin]
POST   /api/v1/messages
DELETE /api/v1/messages/:id         [Admin]

GET    /api/v1/users                [Admin]
```

---

## License

MIT
