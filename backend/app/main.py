from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import webhooks, dashboard
from app.db.session import engine, Base
from app.core.config import settings

# Create db tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DevSecOps Platform JSON API")

# Configure CORS for local dev and cloud deployment (e.g. Vercel)
raw_origins = settings.ALLOWED_ORIGINS.split(",")
origins = [o.strip() for o in raw_origins if o.strip()]
if "*" in origins or not origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(webhooks.router, tags=["Webhooks"])
app.include_router(dashboard.router, tags=["Dashboard"], prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "app": "devsecops api"}
