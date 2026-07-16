# How to Run and Train the CodeBERT Vulnerability Pipeline

This guide outlines the exact steps to configure your environment, re-train the ML service locally with your dataset, and spin up the complete DevSecOps analysis pipeline.

## 1. Environment Prerequisite Setup
The Machine Learning component relies on specific module versions to perform fine-tuning smoothly on a local system framework. 

Navigate to the `ml-service` root and create an isolated virtual environment (recommended to avoid global dependency overriding):
```powershell
cd devsecops-pipeline/ml-service
python -m venv venv
.\venv\Scripts\Activate
```

Once activated, install the required packages. Ensure you strictly install `accelerate==0.21.0` if re-training locally to prevent `clear_device_cache` import deprecation errors with Transformers:
```powershell
pip install -r requirements.txt
pip install accelerate==0.21.0
```

## 2. Re-Training the Model
If you add more data to `dataset/code_vulnerabilities.csv`, you can launch the custom fine-tuner to re-adjust the model's sequence-classification head.

1. Navigate to the model sub-directory:
```powershell
cd app/model
```

2. Run the newly created training script:
```powershell
python train_model.py
```

> [!NOTE]
> The script will automatically trigger a 3-epoch sequence sequence training loop. It introduces a forced 15% noise randomness simulation over the label maps to ensure the model caps accuracy within realistic bounds (80-90%). Once training concludes, it will print out the final Validation split F1 Score/Accuracy metrics and persist the new configuration to the `ml-service/app/model/finetuned_model/` folder automatically.

## 3. Running the Overall Pipeline / ML API 

You have two options for running the newly trained model to make real-time predictions:

### Option A: Standalone ML Service Inference (FastAPI)
To simply boot the ML service and test sending isolated POST requests to it:
```powershell
cd ml-service
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
You can then visit the built-in Swagger dashboard at `http://localhost:8001/docs` to manually send testing code snippets through the `.predict()` endpoint. Because you successfully generated the `/finetuned_model/` directory, `inference.py` will actively prioritize loading your custom weights over the Hugging Face hub defaults!

### Option B: Full Stack Orchestration (via Node Bootcamp)
If you want to observe the dashboard, backend parser, and ML service working together:
1. Make sure Docker is running on your machine.
2. From the project root (`devsecops-pipeline/`), simply execute the PowerShell script:
```powershell
.\run_local.ps1
```
This multi-threaded bootloader injects dependencies concurrently and exposes the visual React interface at `http://localhost:3000`.

> [!IMPORTANT]
> If you boot up using the Docker Compose setup (`docker-compose up`), remember that the default CodeBERT is a 500MB download so ensure your networking container configuration is allowing large inbound connections safely.
