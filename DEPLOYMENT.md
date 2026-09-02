# FinTrack 3D — Render Deployment Guide

This project is configured to be deployed as a **single Web Service** on Render. The Express backend serves both the API and the compiled React frontend static files.

---

## Step 1 — Prepare the Repository

Ensure your root `package.json` has the correct scripts for Render deployment:

```json
"scripts": {
  "postinstall": "npm install --prefix backend && npm install --prefix frontend",
  "build": "npm run build --prefix frontend",
  "start": "npm start --prefix backend"
}
```

*(This is already set up in the repository.)*

---

## Step 2 — Deploy on Render

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** and select **Web Service**
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name:** `fintrack-3d` (or whatever you prefer)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add the following **Environment Variables**:
   
| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://dshryqxlzgvbrdckludv.supabase.co` |
| `SUPABASE_KEY` | `<your supabase service_role key>` |
| `JWT_SECRET` | `fintrack_3d_super_secret_jwt_key_2026` (or a stronger secret) |
| `GOOGLE_CLIENT_ID` | `338569088980-10u0cn5vdi7a84tqu6mo3i603soo397n.apps.googleusercontent.com` |
| `VITE_GOOGLE_CLIENT_ID` | `338569088980-10u0cn5vdi7a84tqu6mo3i603soo397n.apps.googleusercontent.com` |
| `VITE_API_URL` | `/api` |

6. Click **Create Web Service**.

> **After deploying**, note your Render app URL, e.g. `https://fintrack-3d.onrender.com`

---

## Step 3 — Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Open your OAuth 2.0 client
3. Under **Authorized JavaScript origins**, add your Render URL:
   - `https://fintrack-3d.onrender.com`
   - `http://localhost:5173`
4. Under **Authorized redirect URIs**, no changes needed (Google Sign-In uses popup)
5. Save

---

## Local Development

```bash
# Install dependencies for both backend and frontend
npm run postinstall

# Run the backend and serve the frontend simultaneously
npm run build
npm start
# Runs on http://localhost:5000

# Or, for hot-reloading development:
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
# API calls proxied to localhost:5000 via vite.config.js
```

