import httpx
import time
from sqlalchemy.orm import Session
from app.db.models import PullRequest, ScanRun, Finding, ScanStatus, Severity
from app.core.config import settings

def run_pipeline(scan_run_id: int, pr_id: int, db: Session):
    scan_run = db.query(ScanRun).filter(ScanRun.id == scan_run_id).first()
    if not scan_run:
        return
        
    scan_run.status = ScanStatus.RUNNING
    db.commit()
    
    pr = db.query(PullRequest).filter(PullRequest.id == pr_id).first()
    
    # 1. Fetch changed files from GitHub (mocked or actual)
    # We will simulate fetching file diffs for brevity unless a real token is provided
    # Let's hit the ML Service with some simulated code snippets
    # In a real environment, you'd use PyGithub:
    # gh = Github(settings.GITHUB_TOKEN)
    # repo = gh.get_repo(pr.repository.full_name)
    # pull = repo.get_pull(pr.pr_number)
    # files = pull.get_files()
    
    # Dummy file representation
    files = [
        {"filename": "app/auth.py", "code": "password = 'supersecret_hardcoded_password'"},
        {"filename": "app/views.py", "code": "os.system(user_input)"}
    ]
    
    risk_score = 0
    
    # 2. ML Service Scan
    try:
        with httpx.Client() as client:
            for f in files:
                resp = client.post(f"{settings.ML_SERVICE_URL}/predict", json={
                    "language": "python",
                    "file_path": f["filename"],
                    "code": f["code"]
                })
                if resp.status_code == 200:
                    data = resp.json().get("predictions", [])
                    for pred in data:
                        sev = pred.get("severity", "medium").lower()
                        finding = Finding(
                            scan_run_id=scan_run.id,
                            source="codebert",
                            severity=Severity(sev),
                            title=pred.get("label"),
                            description=pred.get("explanation"),
                            file_path=pred.get("file_path", f["filename"]),
                            line_number=pred.get("start_line"),
                            confidence_score=pred.get("confidence"),
                            cwe_id=pred.get("cwe")
                        )
                        db.add(finding)
                        
                        if sev == "critical": risk_score += settings.CRITICAL_SCORE
                        elif sev == "high": risk_score += settings.HIGH_SCORE
                        elif sev == "medium": risk_score += settings.MEDIUM_SCORE
                        else: risk_score += settings.LOW_SCORE
                        
    except Exception as e:
        print(f"Error calling ML service: {e}")
        
    # 3. SonarQube Scan Execution
    # In real life, trigger a scan via docker exec or remote API
    # Since executing via background task is complex, we simulate fetching SonarQube issues
    # after waiting for a bit, or simulate findings.
    
    # Dummy sonarqube findings
    sq_finding = Finding(
        scan_run_id=scan_run.id,
        source="sonarqube",
        severity=Severity.HIGH,
        title="Command Injection",
        description="Make sure using os.system is safe here.",
        file_path="app/views.py",
        line_number=12,
        confidence_score=1.0,
        cwe_id="CWE-78"
    )
    db.add(sq_finding)
    risk_score += settings.HIGH_SCORE
    
    db.commit()
    
    # 4. Result Aggregation and Gate Checking
    scan_run.risk_score = risk_score
    score_threshold = 15 # Configurable Gate
    scan_run.passed = risk_score < score_threshold
    scan_run.status = ScanStatus.COMPLETED
    db.commit()
    
    # 5. Comment on GitHub (Requires Token)
    # if settings.GITHUB_TOKEN:
    #    gh = Github(settings.GITHUB_TOKEN)
    #    ... post comment on PR
    
    print(f"Pipeline completed for PR {pr.pr_number}. Passed: {scan_run.passed}. Risk Score: {scan_run.risk_score}")
