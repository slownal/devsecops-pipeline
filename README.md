# DevSecOps AI Pipeline Platform 🛡️

A production-style DevSecOps Security Review Platform that integrates with GitHub Pull Requests to automatically perform code vulnerability analysis using **SonarQube** and a **Transformer-based ML service (CodeBERT)**.

![Overview Placeholder](https://via.placeholder.com/800x400.png?text=DevSecOps+Pipeline+Dashboard)

## 🎯 Architecture
The system consists of independent microservices orchestrated via Docker Compose:

1. **Frontend (React + Vite + TailwindCSS)**: A minimalist, dark-themed dashboard to review security posture.
2. **Backend API (FastAPI + PostgreSQL)**: Core orchestrator. Handles GitHub Webhooks, triggers scans, aggregates SonarQube & ML findings, and serves REST API.
3. **ML Service (FastAPI + PyTorch + Transformers)**: Runs inference on code chunks using Hugging Face's CodeBERT for vulnerability detection.
4. **SonarQube**: Official static analysis engine.
5. **PostgreSQL**: Relational storage for repos, scans, findings, and history.

## ✨ Features
- **Automated Webhook Integration**: Listens for PR `opened` or `synchronize` events.
- **Parallel Scanning**: Dispatches jobs to SonarQube and the custom ML model simultaneously.
- **AI Vulnerability Detection**: Uses a mock (or easily pluggable real) CodeBERT pipeline to locate Hardcoded Secrets, Command Injections, etc.
- **Risk Quality Gate**: Configurable scoring threshold to dynamically fail or pass PRs.
- **Modern Minimal UI**: Sleek, Vercel-like dashboard for visualizing security metrics.

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Docker and Docker Compose
- Node.js (if running UI outside docker)
- Python 3.11+ (if running API locally)

### Deploy via Docker
```bash
# 1. Clone the repository
git clone https://github.com/yourusername/devsecops-pipeline.git
cd devsecops-pipeline

# 2. Add an environment file
cp default.env .env

# 3. Spin up the cluster
docker-compose up --build -d
```

### Accessing the Services
- **React Dashboard**: `http://localhost:3000`
- **FastAPI Core Swagger Docs**: `http://localhost:8000/docs`
- **ML Service Swagger Docs**: `http://localhost:8001/docs`
- **SonarQube UI**: `http://localhost:9000` (admin/admin)

## 🛠️ Tech Stack
* **Frontend**: React 18, React Router, TailwindCSS, Axios, Lucide React
* **Backend**: Python, FastAPI, SQLAlchemy, Alembic, Pydantic, PyGithub
* **ML**: PyTorch, Hugging Face Transformers (`microsoft/codebert-base`)
* **Infra**: Docker Compose, PostgreSQL 15, GitHub Actions

## 🧠 ML Inference Engine
The `ml-service` contains an inference wrapper around CodeBERT. By default, it runs a heuristic fallback to remain extremely lightweight for local development. Set `USE_REAL_MODEL=true` in `docker-compose.yml` to automatically download the CodeBERT weights.

## 🤝 Next Steps / Future Improvements
* Set up a Celery/Redis queue for highly concurrent PR scanning.
* Add JWT-based Auth to the React UI.
* Deploy onto AWS EKS or ECS.
* Fine-tune the CodeBERT model on a massive labeled vulnerability dataset for actual production deployment.
