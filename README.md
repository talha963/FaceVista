# 🌟 FaceVista: Clinical AI Facial Visualization Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

FaceVista is the premier AI-assisted consultation platform designed to bridge the gap between patient expectations and surgical reality. By leveraging advanced computer vision and generative AI, FaceVista safely maps facial anatomy to generate highly realistic, graduated surgical simulations (Subtle, Moderate, Pronounced) while rigorously preserving patient identity.

---

## ✨ Core Features

*   **👨‍⚕️ Clinical-Grade Landing Page:** A highly polished, medical-grade UI engineered to build trust, featuring Dark & Light mode integration.
*   **🎯 Live Analysis UI:** Custom CSS-animated biometric scanning overlays demonstrating the precision of FaceVista's 468-point facial landmark mapping.
*   **🏥 Procedure Previews:** Specialized AI support mapped out for:
    *   Rhinoplasty (Nose bridge, tip refinement, width)
    *   Genioplasty (Chin projection and reduction)
    *   Jaw Contouring (Masseter reduction and symmetry correction)
*   **🔄 Graduated Variations:** Automatically generates *Subtle*, *Moderate*, and *Pronounced* simulations to establish a perfect communicative baseline between surgeon and patient.
*   **🔒 Security First:** Built for HIPAA-compliant workflows, featuring automated image wiping post-simulation.

## 🏗️ Technology Stack

*   **Frontend:** Next.js 15, React 19, Tailwind CSS v4, `next-themes` (Dark/Light mode).
*   **Backend:** FastAPI (Python 3.11), SQLAlchemy, OpenCV (Computer Vision).
*   **Database & Caching:** PostgreSQL 15, Redis 7.
*   **Infrastructure:** Fully Dockerized (`docker-compose`) for seamless one-click local deployment.

---

## 🚀 Getting Started

FaceVista is containerized to ensure it runs flawlessly on any machine with zero environment setup required.

### Prerequisites
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.
*   Git

### 1-Click Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/talha963/FaceVista.git
   cd FaceVista
   ```

2. **Build and start the application**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the platform**
   * **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   * **Backend API (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)

### Stopping the platform
```bash
docker-compose down
```

---

## 📁 Project Structure

```text
FaceVista/
├── frontend/             # Next.js 15 UI, Tailwind v4, Theme Providers
│   ├── src/app/          # Global styles, page routes, layouts
│   ├── src/components/   # Reusable UI components (ThemeToggles)
│   └── Dockerfile        # Node 20 Alpine builder
├── backend/              # FastAPI Application (Computer Vision & APIs)
│   ├── main.py           # Core API router and logic
│   ├── requirements.txt  # Python dependencies (OpenCV, FastAPI)
│   └── Dockerfile        # Python 3.11 Slim builder
├── docker-compose.yml    # Orchestrates frontend, backend, redis, & db
└── FaceVista_Documentation.pdf # Detailed 12-chapter technical architecture
```

---

## 🛡️ Medical Disclaimer
*FaceVista generates visual illustrations using Generative AI for educational and communication purposes exclusively. It is not a medical diagnostic device and does not guarantee surgical outcomes. All medical decisions must be formally assessed by a licensed, board-certified medical professional.*
