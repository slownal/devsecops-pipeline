import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DevSecOps Platform API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://goparth:goparth@localhost:5432/devsecops")
    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "supersecret")
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "") # Used to fetch PR details and leave comments
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
    SONARQUBE_URL: str = os.getenv("SONARQUBE_URL", "http://localhost:9000")
    SONARQUBE_TOKEN: str = os.getenv("SONARQUBE_TOKEN", "admin")
    
    # Severity Thresholds
    CRITICAL_SCORE: int = 10
    HIGH_SCORE: int = 7
    MEDIUM_SCORE: int = 4
    LOW_SCORE: int = 1

    class Config:
        env_file = ".env"

settings = Settings()
