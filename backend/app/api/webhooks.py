from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks, Depends
import hashlib
import hmac
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.db.models import Repository, PullRequest, ScanRun, ScanStatus
from app.services.scanner import run_pipeline

router = APIRouter()

def verify_signature(payload_body: bytes, signature_header: str):
    if not signature_header:
        raise HTTPException(status_code=403, detail="x-hub-signature-256 header is missing!")
    
    hash_object = hmac.new(settings.GITHUB_WEBHOOK_SECRET.encode('utf-8'), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(status_code=403, detail="Request signatures didn't match!")

@router.post("/webhooks/github")
async def github_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: str = Header(None),
    x_github_event: str = Header(None),
    db: Session = Depends(get_db)
):
    # Depending on how the user sets up, they might not configure webhook secret locally. Let's make verification optional if secret is default
    payload_body = await request.body()
    if settings.GITHUB_WEBHOOK_SECRET != "supersecret":
        verify_signature(payload_body, x_hub_signature_256)

    if x_github_event == "ping":
        return {"msg": "pong"}

    if x_github_event == "pull_request":
        payload = await request.json()
        action = payload.get("action")
        
        if action in ["opened", "synchronize", "reopened"]:
            pr_data = payload.get("pull_request", {})
            repo_data = payload.get("repository", {})
            
            repo_full_name = repo_data.get("full_name")
            repo = db.query(Repository).filter(Repository.full_name == repo_full_name).first()
            if not repo:
                repo = Repository(name=repo_data.get("name"), full_name=repo_full_name, url=repo_data.get("html_url"))
                db.add(repo)
                db.commit()
                db.refresh(repo)
                
            pr = db.query(PullRequest).filter(
                PullRequest.repository_id == repo.id,
                PullRequest.pr_number == pr_data.get("number")
            ).first()
            
            if not pr:
                pr = PullRequest(
                    repository_id=repo.id,
                    pr_number=pr_data.get("number"),
                    title=pr_data.get("title"),
                    branch=pr_data.get("head", {}).get("ref", "unknown"),
                    commit_sha=pr_data.get("head", {}).get("sha", "unknown")
                )
                db.add(pr)
                db.commit()
                db.refresh(pr)
            else:
                pr.commit_sha = pr_data.get("head", {}).get("sha", "unknown")
                db.commit()
                db.refresh(pr)
                
            # Create a ScanRun
            scan_run = ScanRun(pull_request_id=pr.id, status=ScanStatus.PENDING)
            db.add(scan_run)
            db.commit()
            db.refresh(scan_run)
            
            # Start background pipeline
            background_tasks.add_task(run_pipeline, scan_run.id, pr.id, db)
            
            return {"msg": "Scan initialized", "scan_run_id": scan_run.id}
            
    return {"msg": "Event ignored"}
