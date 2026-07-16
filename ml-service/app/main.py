from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.model.inference import detector

app = FastAPI(title="ML Vulnerability Service")

class PredictRequest(BaseModel):
    language: str
    file_path: str
    code: str

class Prediction(BaseModel):
    label: str
    confidence: float
    severity: str
    explanation: str
    cwe: Optional[str] = None
    start_line: Optional[int] = None
    end_line: Optional[int] = None

class PredictResponse(BaseModel):
    predictions: List[Prediction]

@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    if not payload.code.strip():
        raise HTTPException(status_code=400, detail="Empty code provided")
        
    res = detector.predict(payload.code, payload.file_path)
    return {"predictions": res}

@app.get("/health")
def health_check():
    return {"status": "up", "model_loaded": detector.ready}
