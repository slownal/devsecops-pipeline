# DevSecOps Pipeline: Setup & Run Guide

When you turn off your computer or close out your terminals, the application and its internet connection to GitHub will shut down. 

Follow this straightforward, step-by-step guide to bring your entire DevSecOps environment back online exactly as we successfully set it up today!

---

## 🛑 Understanding the Architecture Boot Process
Because this is a microservices-based project, you have **four separate moving pieces** that need to be started for the pipeline to function correctly:
1. The **Machine Learning Scanner** (Port 8001)
2. The **FastAPI Backend** (Port 8000)
3. The **React Dashboard** (Port 3000)
4. The **Cloudflare Webhook Tunnel** (Connects internet to Port 8000)

---

## Step 1: Start the Local Services
The fastest way to spin up the local environment is to open three separate terminal windows inside your `devsecops-pipeline` folder, or just use the provided PowerShell helper script.

### Method A: The Quick Way (Using the Script)
If you just want to run the python and node services automatically:
1. Open PowerShell by pressing the `Windows Key`, typing `PowerShell`, and hitting Enter.
2. Navigate to your project folder:
   ```powershell
   cd c:\Users\parth\.gemini\antigravity\scratch\devsecops-pipeline
   ```
3. Run the helper script which will pop up three new windows automatically:
   ```powershell
   .\run_local.ps1
   ```

### Method B: The Manual Way (If the script fails)
If you run into issues, open three separate Powershell terminals in the `devsecops-pipeline` root directory and do it manually:

* **Terminal 1 (ML Service):**
  ```powershell
  cd ml-service
  .\venv\Scripts\Activate.ps1
  uvicorn app.main:app --port 8001
  ```
* **Terminal 2 (Backend):**
  ```powershell
  cd backend
  .\venv\Scripts\Activate.ps1
  $env:DATABASE_URL='sqlite:///./devsecops.db'
  uvicorn app.main:app --port 8000
  ```
* **Terminal 3 (React Dashboard):**
  ```powershell
  cd frontend
  npm run dev
  ```

---

## Step 2: Establish the Internet Tunnel (Crucial!)
Because you are running the backend on `localhost:8000` (which is invisible to the public internet), GitHub cannot reach your backend to send the "Pull Request Opened" events. We *must* tunnel the local port using Cloudflare.

1. Open a **4th terminal window**.
2. Navigate to the root directory where `cloudflared.exe` is located:
   ```powershell
   cd c:\Users\parth\.gemini\antigravity\scratch\devsecops-pipeline
   ```
3. Run the Cloudflare Tunnel command:
   ```powershell
   .\cloudflared.exe tunnel --url http://localhost:8000
   ```
4. Look very closely at the terminal output. It will eventually draw a box that says: `Your quick Tunnel has been created! Visit it at...`
5. **Copy the URL provided** (it will look something like `https://some-random-words.trycloudflare.com`). Note: This URL changes every single time you restart the tunnel.

---

## Step 3: Update the GitHub Webhook
Since your `.trycloudflare.com` URL changes every single time you restart your computer, you must tell GitHub what the *new* address is, so they know where to send the ping!

1. Go to your GitHub repository in your browser (e.g., `https://github.com/Parth436/devsecops-pipeline`).
2. Go to **Settings** -> **Webhooks** (on the left sidebar).
3. Find your existing Webhook and click **Edit**.
4. In the **Payload URL** field, carefully remove the old Cloudflare URL and paste the brand new one you just copied. 
5. Add `/webhooks/github` to the very end of it! 
   * *Example:* `https://some-random-words.trycloudflare.com/webhooks/github`
6. Scroll down and click **Update webhook**.

---

## Step 4: Test it Out!
Your entire DevSecOps environment is back online.
1. Open up your React Dashboard by navigating to `http://localhost:3000` in your web browser.
2. Go to GitHub and open a new Pull Request (or close/reopen an existing one).
3. The dashboard will automatically update in real-time as the ML engine scans the code and calculates the Risk Score!
