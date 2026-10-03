from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import mediapipe as mp
import os
import numpy as np
import copy
from typing import List, Dict, Optional


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
    min_detection_confidence=0.75
)
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

class AnalyzeRequest(BaseModel):
    filename: str

class SuggestFacesRequest(BaseModel):
    mesh3d: List[Dict[str, float]]

UPLOAD_DIR = "/app/uploads"

# ============================================================
# MEDIAPIPE LANDMARK INDEX GROUPS (468 landmarks)
# These are the standard MediaPipe Face Mesh landmark indices
# for specific facial regions.
# ============================================================
NOSE_TIP_INDICES = [1, 2, 3, 4, 5, 6, 19, 94, 141, 370]
NOSE_BRIDGE_INDICES = [6, 122, 168, 197, 195, 5, 4, 45, 51, 275, 281]
NOSE_WING_LEFT = [48, 64, 98, 115, 220, 45, 4, 1]
NOSE_WING_RIGHT = [278, 294, 327, 344, 440, 275, 4, 1]
NOSE_ALL = list(set(NOSE_TIP_INDICES + NOSE_BRIDGE_INDICES + NOSE_WING_LEFT + NOSE_WING_RIGHT))

JAW_LEFT = [132, 58, 172, 136, 150, 149, 176, 148, 152]
JAW_RIGHT = [361, 288, 397, 365, 379, 378, 400, 377, 152]
JAW_CHIN = [152, 377, 400, 378, 379, 365, 397, 288, 361, 149, 150, 136, 172, 58, 132, 148, 176]
JAW_ALL = list(set(JAW_LEFT + JAW_RIGHT + JAW_CHIN))

CHEEK_LEFT = [36, 50, 187, 123, 116, 117, 118, 119, 120, 121, 192, 213, 147, 137]
CHEEK_RIGHT = [266, 280, 411, 352, 345, 346, 347, 348, 349, 350, 416, 433, 376, 366]
CHEEK_ALL = list(set(CHEEK_LEFT + CHEEK_RIGHT))

LIPS_UPPER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 78, 82, 13, 312, 308, 317, 14, 87, 178]
LIPS_LOWER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 78, 95, 88, 178, 87, 14, 317, 402, 318]
LIPS_ALL = list(set(LIPS_UPPER + LIPS_LOWER))

FOREHEAD_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                     109, 67, 103, 54, 21, 162, 127, 234, 93, 132, 58, 172]

EYE_LEFT = [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173]
EYE_RIGHT = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
BROW_LEFT = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
BROW_RIGHT = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]


def _gaussian_weight(dist_sq: float, radius_sq: float) -> float:
    """Gaussian falloff for smooth mesh morphing."""
    if dist_sq >= radius_sq:
        return 0.0
    return np.exp(-dist_sq / (radius_sq * 0.4))


def _apply_region_morph(
    mesh: List[Dict[str, float]],
    target_indices: List[int],
    dx: float = 0.0,
    dy: float = 0.0,
    dz: float = 0.0,
    radius: float = 0.04,
    scale_x: float = 1.0,
    scale_y: float = 1.0,
) -> List[Dict[str, float]]:
    """Apply a smooth morph to a region of the mesh with Gaussian falloff."""
    result = copy.deepcopy(mesh)

    # Compute center of the target region
    cx = np.mean([mesh[i]["x"] for i in target_indices if i < len(mesh)])
    cy = np.mean([mesh[i]["y"] for i in target_indices if i < len(mesh)])
    cz = np.mean([mesh[i]["z"] for i in target_indices if i < len(mesh)])
    radius_sq = radius * radius

    for i in range(len(result)):
        px, py, pz = result[i]["x"], result[i]["y"], result[i]["z"]
        dist_sq = (px - cx) ** 2 + (py - cy) ** 2
        w = _gaussian_weight(dist_sq, radius_sq)

        if w > 0.001:
            # Translation
            result[i]["x"] += dx * w
            result[i]["y"] += dy * w
            result[i]["z"] += dz * w

            # Scaling relative to region center
            if scale_x != 1.0:
                result[i]["x"] = cx + (result[i]["x"] - cx) * (1.0 + (scale_x - 1.0) * w)
            if scale_y != 1.0:
                result[i]["y"] = cy + (result[i]["y"] - cy) * (1.0 + (scale_y - 1.0) * w)

    return result


def generate_surgery_suggestions(mesh3d: List[Dict[str, float]]) -> List[Dict]:
    suggestions = []

    # ── 1. RHINOPLASTY (Refinement) ──
    morph = copy.deepcopy(mesh3d)
    morph = _apply_region_morph(morph, NOSE_WING_LEFT + NOSE_WING_RIGHT, dx=0.0, dy=0.0, dz=0.0, radius=0.06, scale_x=0.85)
    morph = _apply_region_morph(morph, NOSE_TIP_INDICES, dx=0.0, dy=-0.015, dz=-0.01, radius=0.05, scale_x=0.85)
    morph = _apply_region_morph(morph, NOSE_BRIDGE_INDICES, dx=0.0, dy=0.0, dz=-0.01, radius=0.06, scale_x=0.85)
    suggestions.append({
        "id": "rhinoplasty",
        "name": "Rhinoplasty",
        "description": "Aggressive nose bridge refinement and tip lift",
        "category": "Nose",
        "icon": "👃",
        "color": "#818cf8",
        "mesh3d": morph,
    })

    # ── 2. JAWLINE CONTOURING (V-Line Surgery) ──
    morph = copy.deepcopy(mesh3d)
    morph = _apply_region_morph(morph, JAW_LEFT, dx=0.015, dy=0.0, dz=0.0, radius=0.1, scale_x=0.9)
    morph = _apply_region_morph(morph, JAW_RIGHT, dx=-0.015, dy=0.0, dz=0.0, radius=0.1, scale_x=0.9)
    morph = _apply_region_morph(morph, JAW_CHIN, dx=0.0, dy=-0.015, dz=-0.01, radius=0.08)
    suggestions.append({
        "id": "jawline",
        "name": "V-Line Jaw Contour",
        "description": "Dramatic V-line jaw reduction and chin sharpening",
        "category": "Jaw",
        "icon": "💎",
        "color": "#34d399",
        "mesh3d": morph,
    })

    # ── 3. CHEEKBONE LIFT (High Cheekbones) ──
    morph = copy.deepcopy(mesh3d)
    morph = _apply_region_morph(morph, CHEEK_LEFT, dx=-0.01, dy=-0.015, dz=-0.01, radius=0.08, scale_x=1.05, scale_y=1.05)
    morph = _apply_region_morph(morph, CHEEK_RIGHT, dx=0.01, dy=-0.015, dz=-0.01, radius=0.08, scale_x=1.05, scale_y=1.05)
    suggestions.append({
        "id": "cheekbone",
        "name": "High Cheekbone Lift",
        "description": "Pronounced cheekbone augmentation and lifting",
        "category": "Cheeks",
        "icon": "✨",
        "color": "#f472b6",
        "mesh3d": morph,
    })

    # ── 4. LIP ENHANCEMENT (Plumping) ──
    morph = copy.deepcopy(mesh3d)
    morph = _apply_region_morph(morph, LIPS_UPPER, dx=0.0, dy=-0.005, dz=-0.005, radius=0.05, scale_y=1.15, scale_x=1.05)
    morph = _apply_region_morph(morph, LIPS_LOWER, dx=0.0, dy=0.005, dz=-0.005, radius=0.05, scale_y=1.15, scale_x=1.05)
    suggestions.append({
        "id": "lip_enhancement",
        "name": "Lip Enhancement",
        "description": "Dramatic lip volume boost and plumping",
        "category": "Lips",
        "icon": "💋",
        "color": "#fb923c",
        "mesh3d": morph,
    })

    # ── 5. FULL HARMONY (Extreme Makeover) ──
    morph = copy.deepcopy(mesh3d)
    morph = _apply_region_morph(morph, NOSE_ALL, dx=0.0, dy=-0.01, dz=-0.01, radius=0.07, scale_x=0.85)
    morph = _apply_region_morph(morph, JAW_LEFT, dx=0.015, dy=0.0, dz=0.0, radius=0.1, scale_x=0.9)
    morph = _apply_region_morph(morph, JAW_RIGHT, dx=-0.015, dy=0.0, dz=0.0, radius=0.1, scale_x=0.9)
    morph = _apply_region_morph(morph, CHEEK_LEFT, dx=-0.01, dy=-0.01, dz=-0.005, radius=0.07)
    morph = _apply_region_morph(morph, CHEEK_RIGHT, dx=0.01, dy=-0.01, dz=-0.005, radius=0.07)
    morph = _apply_region_morph(morph, LIPS_ALL, dx=0.0, dy=0.0, dz=-0.005, radius=0.04, scale_y=1.1)
    suggestions.append({
        "id": "full_harmony",
        "name": "Extreme Makeover",
        "description": "A completely transformed facial structure combining all procedures",
        "category": "Complete",
        "icon": "🌟",
        "color": "#a78bfa",
        "mesh3d": morph,
    })

    return suggestions




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
    overlay = annotated_image.copy()
    cv2.rectangle(overlay, (0, 0), (overlay.shape[1], overlay.shape[0]), (255, 150, 0), -1)
    final_image = cv2.addWeighted(overlay, 0.15, annotated_image, 0.85, 0)

    # Save output back to the shared volume
    output_filename = f"analyzed_{req.filename}"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    cv2.imwrite(output_path, final_image)

    # Extract the 3D point cloud for the frontend to generate the 3D face (exclude 10 iris landmarks)
    mesh_3d = []
    if results.multi_face_landmarks:
        for landmark in list(results.multi_face_landmarks[0].landmark)[:468]:
            mesh_3d.append({"x": landmark.x, "y": landmark.y, "z": landmark.z})

    # Generate AI surgery suggestions based on the extracted face mesh
    surgery_suggestions = generate_surgery_suggestions(mesh_3d)

    return {
        "success": True, 
        "analyzed_filename": output_filename,
        "analyzed_url": f"/uploads/{output_filename}",
        "mesh_3d": mesh_3d,
        "surgery_suggestions": surgery_suggestions,
    }

@app.post("/suggest-faces")
async def suggest_faces(req: SuggestFacesRequest):
    """Standalone endpoint to regenerate surgery suggestions from existing mesh data."""
    if not req.mesh3d or len(req.mesh3d) < 400:
        raise HTTPException(status_code=400, detail="Invalid mesh data")
    
    suggestions = generate_surgery_suggestions(req.mesh3d)
    return {"success": True, "suggestions": suggestions}

@app.get("/health")
def health_check():
    return {"status": "ok"}
