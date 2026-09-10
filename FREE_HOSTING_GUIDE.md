# 🌐 Complete Guide: Hosting DevSecOps Pipeline for Free

This guide walks you through hosting your full **DevSecOps Pipeline** for **100% free** with zero server costs and permanent HTTPS endpoints for GitHub Webhooks.

---

## 🏗️ Architecture Overview

| Component | Host | Cost | Why This Choice? |
| :--- | :--- | :--- | :--- |
| **Frontend** (React + Vite) | **[Vercel](https://vercel.com)** | **$0** (Free Forever) | Global CDN edge network, instant builds, custom domain support, automatic deploys on Git push. |
| **Backend API** (FastAPI) | **[Render](https://render.com)** | **$0** (Free Web Service) | Gives a **permanent public HTTPS URL** (`https://xxx.onrender.com`), essential for GitHub Webhooks. |
| **Database** (PostgreSQL) | **[Neon](https://neon.tech)** or **Render** | **$0** (Free Tier) | Neon offers generous free serverless PostgreSQL with zero setup. |
| **ML Service** (FastAPI) | **[Render](https://render.com)** | **$0** (Free Web Service) | Deployed alongside the backend on Render (or runs via built-in fallback). |

---

## 🚀 Step 1: Push the Prepared Code to GitHub

First, commit and push the updated configurations to your repository:

```bash
git add .
git commit -m "feat: configure cloud hosting for Vercel and Render"
git push origin main
```

---

## 🗄️ Step 2: Set Up Free PostgreSQL (Neon.tech - 1 Minute)

1. Go to **[neon.tech](https://neon.tech)** and sign up for free (using GitHub login).
2. Click **Create Project**.
   - Name: `devsecops-db`
   - Postgres version: Default (15 or 16)
   - Region: Choose closest to you (e.g., US East / Europe)
3. Once created, copy the **Connection string** shown on the dashboard:
   - Format: `postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`
   *(Keep this copied for Step 3)*.

---

## ⚙️ Step 3: Deploy Backend on Render (Free)

1. Go to **[render.com](https://render.com)** and sign in with your GitHub account.
2. Click **New +** (top right) ➡️ **Web Service**.
3. Select your repository: `slownal/devsecops-pipeline`.
4. Configure the Web Service settings:
   - **Name**: `devsecops-backend`
   - **Region**: Oregon or Frankfurt
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL`: *(Paste your Neon connection string from Step 2)*
   - `ALLOWED_ORIGINS`: `*`
   - `GITHUB_WEBHOOK_SECRET`: `supersecret` *(or any secret password of your choice)*
6. Click **Deploy Web Service**.
7. Once deployed, Render will show your public URL at the top:
   - Example: `https://devsecops-backend-abc.onrender.com`
   *(Copy this URL for Frontend and GitHub Webhook)*.

> [!TIP]
> **Alternative: 1-Click Blueprint Deploy**
> You can also click **New +** ➡️ **Blueprint** on Render and select this repository. Render will automatically read `render.yaml` and configure everything in one shot!

---

## 💻 Step 4: Deploy Frontend on Vercel (Free)

1. Go to **[vercel.com](https://vercel.com)** and log in with your GitHub account.
2. Click **Add New...** ➡️ **Project**.
3. Select `slownal/devsecops-pipeline` from the Git repository list.
4. In the setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: *(Paste your Render backend URL, e.g. `https://devsecops-backend-abc.onrender.com`)*
6. Click **Deploy**.
7. In ~30 seconds, your site is live! You will get a URL like `https://devsecops-pipeline.vercel.app`.

---

## 🔗 Step 5: Connect GitHub Webhook to Render

Now that your backend has a permanent HTTPS URL, you never need `cloudflared.exe` again!

1. Go to your GitHub repository: [github.com/slownal/devsecops-pipeline](https://github.com/slownal/devsecops-pipeline).
2. Click **Settings** ➡️ **Webhooks** (in left sidebar) ➡️ **Add webhook**.
3. Fill in:
   - **Payload URL**: `https://<YOUR-RENDER-BACKEND-URL>/webhooks/github`
     *(Example: `https://devsecops-backend-abc.onrender.com/webhooks/github`)*
   - **Content type**: `application/json`
   - **Secret**: `supersecret` *(Must match the `GITHUB_WEBHOOK_SECRET` you set on Render)*
   - **Which events would you like to trigger this webhook?**: Choose **Let me select individual events**, then check **Pull requests**.
4. Click **Add webhook**.

---

## ✅ Step 6: Test Your Live System!

1. Open your live **Vercel Dashboard URL** in your browser.
2. In your GitHub repository, open a new Pull Request (or edit a file on a branch and create a PR).
3. GitHub sends a ping directly to your Render backend.
4. The backend runs the security vulnerability analysis and records findings.
5. Your Vercel dashboard will instantly show the new PR, Risk Score, and Vulnerability Triage details!

---

## 💡 Notes on Free Tier Behavior
- **Render Free Spin-down**: On the free tier, if no requests come in for 15 minutes, Render puts the backend to sleep. The first request will take ~30 seconds to wake it up, after which it runs at full speed.
- **SonarQube**: Standard SonarQube requires ~3GB+ of RAM, which exceeds all free cloud tiers. This setup utilizes our CodeBERT-powered ML scanner and built-in static heuristics for vulnerability detection at $0/month.
