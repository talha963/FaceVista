from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import mediapipe as mp
import os
import numpy as np

app = FastAPI()

# Enable CORS so Next.js can call it directly from the browser if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

class AnalyzeRequest(BaseModel):
    filename: str

UPLOAD_DIR = "/app/uploads"

@app.post("/analyze")
async def analyze_image(req: AnalyzeRequest):
    input_path = os.path.join(UPLOAD_DIR, req.filename)
    
    if not os.path.exists(input_path):
        raise HTTPException(status_code=404, detail=f"File not found: {req.filename}")

    # Read image using OpenCV
    image = cv2.imread(input_path)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image or corrupted file")

    # Convert to RGB for MediaPipe processing
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    # Create a copy for drawing the clinical overlay
    annotated_image = image.copy()
    
    for face_landmarks in results.multi_face_landmarks:
        # Draw Tesselation (the wireframe mask)
        mp_drawing.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_TESSELATION,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_tesselation_style()
        )
        # Draw Contours (eyes, lips, eyebrows)
        mp_drawing.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_CONTOURS,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_contours_style()
        )
        # Draw Irises
        mp_drawing.draw_landmarks(
            image=annotated_image,
            landmark_list=face_landmarks,
            connections=mp_face_mesh.FACEMESH_IRISES,
            landmark_drawing_spec=None,
            connection_drawing_spec=mp_drawing_styles.get_default_face_mesh_iris_connections_style()
        )

    # Apply a highly technical "clinical blue" tint map to the background outside the face
    # We create a blue overlay and blend it slightly for a sci-fi/medical UI feel
    overlay = annotated_image.copy()
    cv2.rectangle(overlay, (0, 0), (overlay.shape[1], overlay.shape[0]), (255, 150, 0), -1) # Blue in BGR
    
    # Blend it subtly (15% opacity blue tint)
    final_image = cv2.addWeighted(overlay, 0.15, annotated_image, 0.85, 0)

    # Save output back to the shared volume
    output_filename = f"analyzed_{req.filename}"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    cv2.imwrite(output_path, final_image)

    return {
        "success": True, 
        "analyzed_filename": output_filename,
        "analyzed_url": f"/uploads/{output_filename}"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
