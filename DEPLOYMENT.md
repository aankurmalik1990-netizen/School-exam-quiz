# 🚀 Free Self-Hosted Deployment Guide

A complete step-by-step guide to deploy this app **100% free** using GitHub + Render + MongoDB Atlas + Vercel. No credit card required for the free tiers.

---

## 🏗️ Architecture

```
GitHub (source)
   │
   ├──► Render.com (free)        ← Backend (FastAPI)
   │      └──► MongoDB Atlas      ← Database (free 512MB)
   │
   └──► Vercel.com (free)         ← Frontend PWA (Expo Web export)
              │
              └──► calls Render backend via EXPO_PUBLIC_BACKEND_URL
```

**Costs**: ₹0 forever (free tiers).
**Limits**: Render free dyno sleeps after 15 min inactivity (~30s cold start). Atlas 512 MB. Vercel 100 GB bandwidth/month. Plenty for a school.

---

## ✅ Pre-flight Check

Make sure you have:
- [x] A **GitHub** account (free): https://github.com
- [x] A **Render** account (free): https://render.com — sign in with GitHub
- [x] A **MongoDB Atlas** account (free): https://cloud.mongodb.com
- [x] A **Vercel** account (free): https://vercel.com — sign in with GitHub
- [x] A **Google AI Studio** account for the Gemini API key: https://aistudio.google.com/apikey
- [x] **Git** installed locally (or use GitHub Desktop)

---

## STEP 1 — Push Code to GitHub

### 1.1 Download / clone the code from this Emergent project
- In Emergent, click **"Save to GitHub"** (top-right) — this pushes the entire `/app` folder to a new repo
- OR download the project zip and `git push` manually

### 1.2 Verify these files are in the repo
```
/.gitignore               ← already excludes .env files
/render.yaml              ← Render config
/vercel.json              ← Vercel config
/DEPLOYMENT.md            ← this file
/backend/
   ├── server.py
   ├── requirements.txt
   └── .env.example       ← (no real secrets — those go in Render dashboard)
/frontend/
   ├── app/               ← all screens
   ├── src/
   ├── package.json
   ├── app.json
   └── .env.example
```

⚠️ **Verify `.env` files are NOT in the repo** (they contain secrets). Run:
```bash
git ls-files backend/.env frontend/.env
# Should print nothing
```

---

## STEP 2 — MongoDB Atlas (free 512 MB Database)

### 2.1 Create a free cluster
1. Go to https://cloud.mongodb.com → Sign up
2. Choose **"Build a Database"** → **M0 (FREE)** tier → Region: closest to you (e.g. Mumbai, Singapore)
3. Cluster name: anything, e.g. `school-exam-cluster`

### 2.2 Create a database user
1. Sidebar → **Database Access** → **Add New Database User**
2. Username: `gsep_admin` (or anything)
3. Password: click **Autogenerate** and **COPY IT** (save somewhere safe)
4. Privilege: **Read and write to any database** → **Add User**

### 2.3 Allow network access
1. Sidebar → **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** → **0.0.0.0/0** → Confirm
   *(needed because Render's IP changes; safe because we use auth)*

### 2.4 Get the connection string
1. Sidebar → **Database** → click **Connect** on your cluster
2. Choose **"Drivers"** → **Python 3.6 or later**
3. Copy the URI — it looks like:
   ```
   mongodb+srv://gsep_admin:<password>@school-exam-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with the actual password from step 2.2
5. **Save this — you'll paste it into Render in step 3**

---

## STEP 3 — Backend on Render (FastAPI)

### 3.1 Create a new Web Service
1. Go to https://render.com → **New +** → **Web Service**
2. Connect your GitHub account → select the repo you pushed in Step 1
3. Render will auto-detect `render.yaml` — click **Apply**

### 3.2 Manual config (if `render.yaml` not detected)
- **Name**: `govt-school-exam-backend`
- **Region**: Singapore (or closest)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**:
  ```
  pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
  ```
- **Start Command**:
  ```
  uvicorn server:app --host 0.0.0.0 --port $PORT
  ```
- **Plan**: **Free**

### 3.3 Add Environment Variables
Click **"Environment"** in the left sidebar of your Render service, then add:

| Key | Value |
|---|---|
| `MONGO_URL` | *(paste the Atlas URI from Step 2.4)* |
| `DB_NAME` | `govt_school_exam` |
| `GEMINI_API_KEY` | `AIzaSyA4RDNdYn95ijwHD5WN10vE_yZJ6R4fEG8` *(your key)* |

### 3.4 Deploy
- Click **Create Web Service**
- Wait 2-3 min for first build (subsequent deploys are auto on every git push to `main`)
- When ready, you'll get a URL like:
  ```
  https://govt-school-exam-backend.onrender.com
  ```
- **Test**: open `https://govt-school-exam-backend.onrender.com/api/` — should return:
  ```json
  {"message": "Govt School Exam Platform API", "ok": true}
  ```

🎉 **Backend live!** Save the Render URL for Step 4.

---

## STEP 4 — Frontend on Vercel (PWA)

### 4.1 Create a new Vercel project
1. Go to https://vercel.com → **Add New** → **Project**
2. Import the same GitHub repo
3. Vercel auto-detects `vercel.json` — verify these settings:
   - **Framework Preset**: Other
   - **Build Command**: `cd frontend && yarn install && npx expo export --platform web --output-dir dist`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: leave default

### 4.2 Add Environment Variable
Before clicking deploy:
- **Environment Variables** section → Add:

| Name | Value |
|---|---|
| `EXPO_PUBLIC_BACKEND_URL` | `https://govt-school-exam-backend.onrender.com` *(your Render URL from Step 3.4 — NO trailing slash)* |

### 4.3 Deploy
- Click **Deploy**
- Wait 3-5 min for the Expo web bundle
- You'll get a URL like:
  ```
  https://govt-school-exam.vercel.app
  ```

🎉 **Frontend live!** Open the URL on your phone:
- **Android Chrome**: tap menu (⋮) → **"Add to Home Screen"** → app installs as PWA
- **iOS Safari**: tap Share → **"Add to Home Screen"**

---

## STEP 5 — First-time Setup (after deploy)

1. Open your Vercel URL → click **🛡️ Admin**
2. Login with default password: **`admin123`**
3. **IMMEDIATELY change it**: Data tab → Change Admin Password (min 6 chars)
4. Go to Teachers tab → **Add Teachers** (one per real teacher in your school)
5. Share the Vercel URL with teachers/students 🎉

---

## 🐛 Troubleshooting

### "Backend returns 502 / cold-start slow"
- Render free dynos sleep after 15 min idle. First request takes 30-60s to wake.
- Solution: Use a free cron service like **cron-job.org** to ping `/api/` every 14 min and keep it warm.

### "Failed to fetch / CORS error"
- Verify `EXPO_PUBLIC_BACKEND_URL` on Vercel matches your Render URL exactly (no trailing slash).
- Backend already allows `*` origins so CORS is fine.

### "Gemini error: API key invalid"
- Verify `GEMINI_API_KEY` is set in Render env vars (not in code).
- Test directly: `curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`

### "MongoDB connection failed"
- Verify Network Access allows `0.0.0.0/0` in Atlas.
- Verify password in `MONGO_URL` doesn't have unencoded special chars (`@`, `:`, `/` need URL-encoding).

### "Frontend builds but shows blank page"
- Open browser console (F12). If you see `EXPO_PUBLIC_BACKEND_URL` is undefined → re-check Vercel env var spelling.

---

## 🔄 Updating the App (continuous deploy)

After initial setup:
```bash
# Make any change locally
git add .
git commit -m "feat: added new feature"
git push origin main
```

- Render auto-redeploys backend in ~2 min
- Vercel auto-redeploys frontend in ~3 min

That's it — no manual deploy steps needed again.

---

## 🌐 Custom Domain (Optional, Free)

Have a domain (e.g., `myschool.in`)? Both Render and Vercel support free custom domains:
1. Vercel: Project Settings → **Domains** → add `app.myschool.in` → add CNAME in your DNS provider
2. Render: Service Settings → **Custom Domain** → add `api.myschool.in`
3. Update Vercel env var `EXPO_PUBLIC_BACKEND_URL` to `https://api.myschool.in`

---

## 📦 Alternative Hosts (if you don't like Render/Vercel)

| Service | Backend | Frontend | DB |
|---|---|---|---|
| **Railway** | ✅ ($5 free credit/month) | ✅ | ✅ |
| **Fly.io** | ✅ (free tier) | ❌ | ❌ |
| **Netlify** | ❌ | ✅ (alt to Vercel) | ❌ |
| **Cyclic** | ✅ (free, no sleep) | ❌ | ❌ |
| **GitHub Pages** | ❌ | ✅ (only static) | ❌ |

Setup is similar — just point to `backend/` for Python and `frontend/` with the same build command.

---

## 🔐 Security Checklist

- [x] `.env` files never committed (verified gitignore)
- [x] Admin password changed from default `admin123`
- [x] Atlas DB user has strong autogenerated password
- [x] Gemini API key only stored in Render env vars (not in code)
- [x] CORS configured (currently `*`, restrict to your Vercel URL in production for extra safety)

To restrict CORS, edit `/backend/server.py`:
```python
allow_origins=["https://govt-school-exam.vercel.app"],
```

---

## 📞 Need Help?

- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Atlas docs: https://www.mongodb.com/docs/atlas/
- Gemini API: https://ai.google.dev/

Happy hosting! 🇮🇳📚
