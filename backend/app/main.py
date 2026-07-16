from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import webhooks, dashboard
from app.db.session import engine, Base

# Create db tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DevSecOps Platform JSON API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router, tags=["Webhooks"])
app.include_router(dashboard.router, tags=["Dashboard"], prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "app": "devsecops api"}
