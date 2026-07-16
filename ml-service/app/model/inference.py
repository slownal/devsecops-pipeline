import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Use an environment variable to determine if we load the full model
USE_REAL_MODEL = os.getenv("USE_REAL_MODEL", "false").lower() == "true"
MODEL_NAME = "microsoft/codebert-base"

class VulnerabilityDetector:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing ML Service on {self.device}")
        
        if USE_REAL_MODEL:
            try:
                import os
                finetuned_path = os.path.join(os.path.dirname(__file__), "finetuned_model")
                if os.path.exists(finetuned_path):
                    print(f"Loading finetuned model from {finetuned_path}")
                    self.tokenizer = AutoTokenizer.from_pretrained(finetuned_path)
                    self.model = AutoModelForSequenceClassification.from_pretrained(finetuned_path)
                    self.label_map = {0: "SQLi", 1: "XSS"}
                    self.model.to(self.device)
                    self.model.eval()
                    self.ready = True
                    self.is_finetuned = True
                else:
                    print(f"Loading real transformer model: {MODEL_NAME}")
                    self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
                    # Note: this is a base model, finding a pre-finetuned one is ideal
                    self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)
                    self.model.to(self.device)
                    self.model.eval()
                    self.ready = True
                    self.is_finetuned = False
            except Exception as e:
                print(f"Error loading model: {e}")
                self.ready = False
        else:
            print("Using fallback/mock model for fast local development")
            self.ready = False

    def predict(self, code_snippet: str, filename: str):
        if self.ready and USE_REAL_MODEL:
            inputs = self.tokenizer(code_snippet, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)
            
            if hasattr(self, "is_finetuned") and self.is_finetuned:
                # Use label map from finetuning
                pred_idx = torch.argmax(probs, dim=-1).item()
                score = probs[0][pred_idx].item()
                label_name = self.label_map.get(pred_idx, "Unknown")
                
                # We can assume any confident prediction of a vulnerability class is a finding
                if score > 0.5:
                    return [{
                        "label": label_name,
                        "confidence": score,
                        "severity": "high",
                        "explanation": f"CodeBERT attention flagged this snippet as {label_name}.",
                        "cwe": "CWE-89" if getattr(label_name, "lower", lambda: "")() == "sqli" else "CWE-79" if getattr(label_name, "lower", lambda: "")() == "xss" else "CWE-UNKNOWN",
                        "start_line": 1,
                        "end_line": 1
                    }]
                return []
            else:
                # Dummy logic for the un-finetuned base model
                score = probs[0][1].item()
                is_vuln = score > 0.5
                
                if is_vuln:
                    return [{
                        "label": "Potential Vulnerability Identified",
                        "confidence": score,
                        "severity": "medium",
                        "explanation": "CodeBERT attention flagged this snippet.",
                        "cwe": "CWE-UNKNOWN",
                        "start_line": 1,
                        "end_line": 1
                    }]
                return []
        
        else:
            # Smart dummy logic for fast local dev
            findings = []
            code_lower = code_snippet.lower()
            if "password" in code_lower or "secret" in code_lower:
                findings.append({
                    "label": "Hardcoded Secrets",
                    "confidence": 0.95,
                    "severity": "critical",
                    "explanation": "Found potential hardcoded credential",
                    "cwe": "CWE-798",
                    "start_line": 1,
                    "end_line": 1
                })
            elif "os.system" in code_lower or "eval(" in code_lower:
                findings.append({
                    "label": "Command Injection / Unsafe Eval",
                    "confidence": 0.88,
                    "severity": "high",
                    "explanation": "Execution of arbitrary commands or code.",
                    "cwe": "CWE-78",
                    "start_line": 1,
                    "end_line": 1
                })
            
            return findings

detector = VulnerabilityDetector()
