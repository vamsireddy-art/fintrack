# FinTrack 3D — Vercel Deployment Guide

This project uses **two separate Vercel deployments** — one for the backend API and one for the React frontend. This is the correct architecture for Vite + Express on Vercel.

---

## Step 1 — Deploy the Backend

### 1.1 Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Under **"Root Directory"**, set it to: `backend`
4. Framework Preset: **Other**
5. Click **Deploy**

### 1.2 Set Environment Variables (Backend)

In your backend Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://dshryqxlzgvbrdckludv.supabase.co` |
| `SUPABASE_KEY` | `<your supabase service_role key>` |
| `JWT_SECRET` | `fintrack_3d_super_secret_jwt_key_2026` (or a stronger secret) |
| `GOOGLE_CLIENT_ID` | `338569088980-10u0cn5vdi7a84tqu6mo3i603soo397n.apps.googleusercontent.com` |
| `FRONTEND_URL` | *(leave blank for now — fill in after deploying frontend)* |

> **After deploying**, note your backend URL, e.g. `https://fintrack-backend.vercel.app`

---

## Step 2 — Deploy the Frontend

### 2.1 Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same** GitHub repository again
3. Under **"Root Directory"**, set it to: `frontend`
4. Framework Preset: **Vite**
5. Click **Deploy**

### 2.2 Set Environment Variables (Frontend)

In your frontend Vercel project → **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | `338569088980-10u0cn5vdi7a84tqu6mo3i603soo397n.apps.googleusercontent.com` |
| `VITE_API_URL` | `https://<your-backend>.vercel.app/api` |

> ⚠️ Replace `<your-backend>` with the actual backend URL from Step 1.

> **After deploying**, note your frontend URL, e.g. `https://fintrack-app.vercel.app`

---

## Step 3 — Connect Frontend ↔ Backend

1. Go back to the **Backend** Vercel project → **Settings → Environment Variables**
2. Set `FRONTEND_URL` = `https://fintrack-app.vercel.app` (your actual frontend URL)
3. Click **Redeploy** the backend (required for env var to take effect)

---

## Step 4 — Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Open your OAuth 2.0 client
3. Under **Authorized JavaScript origins**, add:
   - `https://fintrack-app.vercel.app`
   - `http://localhost:5173`
4. Under **Authorized redirect URIs**, no changes needed (Google Sign-In uses popup)
5. Save

---

## Step 5 — Verify Deployment

Test these URLs in order:

```
GET https://<backend>.vercel.app/api/health
→ Should return: { "status": "ok", "db": "connected" }

GET https://<frontend>.vercel.app/
→ Should show the FinTrack 3D login screen

POST https://<backend>.vercel.app/api/auth/login
→ Test login with valid credentials
```

---

## Local Development

```bash
# Backend (terminal 1)
cd backend
npm install
npm run dev
# Runs on http://localhost:5000

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# API calls proxied to localhost:5000 via vite.config.js
```

---

## Environment Variables Reference

### `backend/.env` (local only — never commit)
```env
GOOGLE_CLIENT_ID=338569088980-...
SUPABASE_URL=https://dshryqxlzgvbrdckludv.supabase.co
SUPABASE_KEY=eyJhbGci...
JWT_SECRET=fintrack_3d_super_secret_jwt_key_2026
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env` (local only — never commit)
```env
VITE_GOOGLE_CLIENT_ID=338569088980-...
VITE_API_URL=
# Leave VITE_API_URL empty locally — vite.config.js proxy handles it
# On Vercel, set VITE_API_URL=https://<backend>.vercel.app/api
```

---

## Architecture Overview

```
GitHub Repo (projectf/)
├── backend/          ← Vercel Project #1 (Node/Express serverless)
│   ├── api/index.js  ← Serverless entry point
│   ├── routes/       ← Express routers
│   ├── config/       ← Supabase client
│   └── vercel.json   ← Rewrites: /* → api/index.js
│
└── frontend/         ← Vercel Project #2 (Vite/React static)
    ├── src/          ← React app
    ├── dist/         ← Built output (gitignored)
    └── vercel.json   ← SPA rewrite: /* → /index.html
```
