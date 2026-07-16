# Real-Time AI DevSecOps Pipeline Architecture and Data Flow

This document outlines the end-to-end architecture, control flow, and technical implementation of the AI-driven DevSecOps Security Platform. It is designed to act as a comprehensive guide to explain the system to stakeholders, peers, or professors.

---

## 1. Project Overview
The **AI DevSecOps Pipeline** is a complete, containerized system that sits between a developer's environment (GitHub) and deployment. Its primary goal is to **intercept Pull Requests**, intelligently analyze the code changes using a machine learning model, and enforce a security quality gate based on calculated risk scores. 

If critical vulnerabilities (like Hardcoded Secrets or Command Injections) are found, the pipeline fails the Pull Request, preventing insecure code from being merged.

## 2. Technology Stack & Core Components

The architecture consists of completely decoupled microservices:

*   **Frontend UI (React/Vite)**
    *   **Port:** `3000`
    *   **Role:** Visualizes the security status of all repositories, pull requests, and vulnerabilities in an intuitive, real-time dashboard. 
*   **Orchestration Backend (FastAPI / Python)**
    *   **Port:** `8000`
    *   **Role:** The "Brain" of the operation. It handles incoming webhooks, interacts with the local SQLite database to store states, triggers scans, calculates risk scores, and exposes API endpoints for the Frontend.
*   **Machine Learning Scanner (CodeBERT / FastAPI)**
    *   **Port:** `8001`
    *   **Role:** The AI engine. Unlike traditional static analysis tools (like SonarQube) which rely entirely on predefined regex rules, this service uses a transformer-based neural network (CodeBERT) to analyze the semantic context of the code and return a list of vulnerabilities with a calculated "Confidence Score".
*   **Internet Tunnel (Cloudflare)**
    *   **Role:** Exposes the local FastAPI backend to the public internet securely, allowing GitHub to deliver Webhook payloads directly to the local development environment (`localhost:8000`).

---

## 3. Step-by-Step Data Flow & Control Flow

This section details exactly what happens the moment a developer opens a Pull Request on GitHub.

### Step 1: Trigger (GitHub Webhook)
1. A developer opens a Pull Request named `Update index.html`.
2. GitHub's webhook system immediately dispatches an HTTP POST request containing a JSON payload with all the PR details to our Cloudflare Tunnel URL.
3. The Cloudflare tunnel (`.trycloudflare.com`) safely routes this traffic through the internet directly to our local machine's `localhost:8000/webhooks/github` endpoint.

### Step 2: Ingestion & Initialization (Backend API)
1. The **FastAPI Backend** (`backend/app/api/webhooks.py`) receives the payload.
2. It parses the JSON, extracting the Repository Name, Pull Request ID, and Branch Information.
3. It updates the local SQLite database, creating a new `PullRequest` record and immediately initializing a `ScanRun` with a status of `PENDING`.
4. It spawns a background task `run_pipeline` to avoid blocking the GitHub request, instantly returning a `200 OK` back to GitHub.

### Step 3: Analysis (ML Service)
1. The backend's background task (`backend/app/services/scanner.py`) fetches the modified files from the Pull Request.
2. The Backend makes an internal network call to the **ML Service's** `/predict` endpoint (`http://localhost:8001`), feeding it the code snippets.
3. The ML Engine evaluates the code. For example, if it sees `password = "12345"`, its CodeBERT model identifies this semantically as a `Hardcoded Secret`, assigns a severity (`Critical`), and calculates its confidence (`95%`).
4. The ML Service responds back to the Backend with an array of findings.

### Step 4: Security Quality Gate Evaluation (Backend Logic)
1. The Backend receives the vulnerabilities from the ML Service and inserts them into the `Finding` table in the database.
2. **Risk Scoring Logic:** The backend calculates a cumulative Risk Score. 
   *(E.g., Critical = weight of 10, High = weight of 8, etc.)*
3. **Threshold Check:** The backend compares the total Risk Score against a strictly defined Threshold Gate *(Set to `15` in `scanner.py` line 92)*.
4. If the Total Risk Score >= 15, the `ScanRun` is marked as **Gate Failed**. Otherwise, it passes safely.

### Step 5: Visualization (React Frontend)
1. The user logs into the **React Dashboard** (`http://localhost:3000`).
2. The dashboard continuously polls the Backend API endpoints (e.g., `/api/scans`).
3. It visualizes the entire process real-time, displaying the glowing red "Gate Failed" badge along with precisely which code file and line numbers caused the failure, allowing the developer to fix the issue before merging.

---

## 4. Key Files & Architecture Map

If you need to show the exact location of the core logic, refer to these files:

*   `run_local.ps1`: The multi-threaded PowerShell bootloader that injects isolated node/python dependencies and boots all three microservices simultaneously.
*   `backend/app/api/webhooks.py`: The entry point for the GitHub trigger.
*   `backend/app/services/scanner.py`: The core orchestrator. This calculates the Risk Score and sets the Threshold limit.
*   `ml-service/app/main.py`: The Machine Learning API layer that houses the CodeBERT prediction logic.
*   `frontend/src/pages/PullRequestReport.tsx`: The primary React View component that maps the JSON findings into the modern UI cards.
