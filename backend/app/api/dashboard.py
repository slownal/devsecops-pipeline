from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from pydantic import BaseModel
from pydantic_settings import BaseSettings
from app.db.session import get_db
from app.db.models import Repository, PullRequest, ScanRun, Finding, ScanStatus, Severity
import datetime
import random

router = APIRouter()

class RepoCreate(BaseModel):
    name: str
    full_name: str
    url: str

class MockScanRequest(BaseModel):
    repository_id: int
    title: str = "Manual PR Scan"
    branch: str = "main"

@router.get("/dashboard/metrics")
def get_metrics(db: Session = Depends(get_db)):
    total_repos = db.query(Repository).count()
    total_scans = db.query(ScanRun).count()
    total_findings = db.query(Finding).count()
    passed_scans = db.query(ScanRun).filter(ScanRun.passed == True).count()
    
    pass_rate = (passed_scans / total_scans * 100) if total_scans > 0 else 100
    
    return {
        "total_repositories": total_repos,
        "total_scans": total_scans,
        "total_vulnerabilities": total_findings,
        "pass_rate": round(pass_rate, 2)
    }

@router.get("/repositories")
def list_repositories(db: Session = Depends(get_db)):
    return db.query(Repository).all()

@router.get("/pull-requests")
def list_pull_requests(db: Session = Depends(get_db)):
    prs = db.query(PullRequest).all()
    out = []
    for pr in prs:
        # Get latest scan
        latest_scan = db.query(ScanRun).filter(ScanRun.pull_request_id == pr.id).order_by(ScanRun.created_at.desc()).first()
        out.append({
            "id": pr.id,
            "title": pr.title,
            "repository": pr.repository.full_name,
            "pr_number": pr.pr_number,
            "latest_scan_status": latest_scan.status.value if latest_scan else "none",
            "passed": latest_scan.passed if latest_scan else True,
            "risk_score": latest_scan.risk_score if latest_scan else 0
        })
    return out

@router.get("/pull-requests/{pr_id}")
def get_pull_request(pr_id: int, db: Session = Depends(get_db)):
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="PR not found")
        
    runs = db.query(ScanRun).filter(ScanRun.pull_request_id == pr.id).all()
    runs_data = []
    for run in runs:
        findings = db.query(Finding).filter(Finding.scan_run_id == run.id).all()
        runs_data.append({
            "id": run.id,
            "status": run.status.value,
            "passed": run.passed,
            "risk_score": run.risk_score,
            "created_at": run.created_at,
            "findings": [
                {
                    "title": f.title,
                    "severity": f.severity.value,
                    "source": f.source,
                    "file_path": f.file_path,
                    "line_number": f.line_number,
                    "confidence_score": f.confidence_score
                } for f in findings
            ]
        })
        
    return {
        "pr_info": {
            "title": pr.title,
            "branch": pr.branch,
            "commit_sha": pr.commit_sha
        },
        "scans": runs_data
    }

@router.post("/repositories")
def create_repository(repo_in: RepoCreate, db: Session = Depends(get_db)):
    existing = db.query(Repository).filter(Repository.full_name == repo_in.full_name).first()
    if existing:
        return existing
        
    repo = Repository(
        name=repo_in.name,
        full_name=repo_in.full_name,
        url=repo_in.url
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo

@router.get("/vulnerabilities")
def get_all_vulnerabilities(db: Session = Depends(get_db)):
    findings = db.query(Finding).all()
    results = []
    for f in findings:
        repo_name = f.scan_run.pull_request.repository.full_name if f.scan_run and f.scan_run.pull_request else "Unknown"
        results.append({
            "id": f.id,
            "repository": repo_name,
            "title": f.title,
            "severity": f.severity.value,
            "source": f.source,
            "file_path": f.file_path,
            "line_number": f.line_number,
            "description": f.description
        })
    return results

@router.post("/generate-mock-scan")
def generate_mock_scan(req: MockScanRequest, db: Session = Depends(get_db)):
    repo = db.query(Repository).filter(Repository.id == req.repository_id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    # Create fake PR
    pr = PullRequest(
        repository_id=repo.id,
        pr_number=random.randint(100, 999),
        title=req.title,
        branch=req.branch,
        commit_sha=f"{random.randint(1000000, 9000000)}"
    )
    db.add(pr)
    db.commit()
    db.refresh(pr)
    
    # Create fake scan
    run = ScanRun(
        pull_request_id=pr.id,
        status=ScanStatus.COMPLETED,
        risk_score=random.randint(1, 100),
        passed=False if random.random() > 0.5 else True,
        completed_at=datetime.datetime.utcnow()
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    
    # Generate 1-3 fake findings
    for i in range(random.randint(1, 3)):
        f = Finding(
            scan_run_id=run.id,
            source="codebert",
            severity=random.choice([Severity.LOW, Severity.MEDIUM, Severity.HIGH, Severity.CRITICAL]),
            title=f"Potential vulnerability {i}",
            description="Generated mock vulnerability from manual trigger.",
            file_path=f"src/file_{i}.py",
            line_number=random.randint(10, 500),
            confidence_score=round(random.random(), 2)
        )
        db.add(f)
        
    db.commit()
    return {"message": "Mock scan generated successfully", "pull_request_id": pr.id}
