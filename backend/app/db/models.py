from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Enum, Text
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.session import Base

class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Repository(Base):
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    full_name = Column(String, unique=True, index=True)
    url = Column(String)
    
    pull_requests = relationship("PullRequest", back_populates="repository")

class PullRequest(Base):
    __tablename__ = "pull_requests"
    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    pr_number = Column(Integer, index=True)
    title = Column(String)
    branch = Column(String)
    commit_sha = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    repository = relationship("Repository", back_populates="pull_requests")
    scan_runs = relationship("ScanRun", back_populates="pull_request")

class ScanRun(Base):
    __tablename__ = "scan_runs"
    id = Column(Integer, primary_key=True, index=True)
    pull_request_id = Column(Integer, ForeignKey("pull_requests.id"))
    status = Column(Enum(ScanStatus), default=ScanStatus.PENDING)
    risk_score = Column(Integer, default=0)
    passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    pull_request = relationship("PullRequest", back_populates="scan_runs")
    findings = relationship("Finding", back_populates="scan_run")

class Finding(Base):
    __tablename__ = "findings"
    id = Column(Integer, primary_key=True, index=True)
    scan_run_id = Column(Integer, ForeignKey("scan_runs.id"))
    source = Column(String) # 'sonarqube' or 'codebert'
    severity = Column(Enum(Severity))
    title = Column(String)
    description = Column(Text)
    file_path = Column(String)
    line_number = Column(Integer, nullable=True)
    confidence_score = Column(Float, nullable=True)
    cwe_id = Column(String, nullable=True)
    
    scan_run = relationship("ScanRun", back_populates="findings")
