from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="FaceVista API",
    description="Backend API for FaceVista Facial Surgery Visualization Platform",
    version="1.0"
)

# Configure CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the FaceVista API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FaceVista Backend API"}
