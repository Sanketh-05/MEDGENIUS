# 🧠 MedGenius — AI-Powered Medical Learning Platform

MedGenius is a comprehensive, AI-driven medical education platform designed to help medical students learn smarter. It combines advanced AI models with interactive clinical tools to deliver a personalized and immersive learning experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20|%20Firestore%20|%20Storage-FFCA28?logo=firebase&logoColor=black)
![Groq](https://img.shields.io/badge/Groq-LLM%20API-000000)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 📚 Core Learning Modules
- **AI Notes Generator** — Generate structured medical notes from any topic or uploaded PDF/DOCX files
- **Adaptive Quiz Engine** — AI-generated MCQ quizzes with difficulty scaling and detailed explanations
- **Smart Flashcards** — Spaced-repetition flashcards generated from study material
- **Study History** — Track previously studied topics for quick revisiting

### 🏥 Clinical Simulation Tools
- **Clinical Case Simulator** — Interactive patient case walkthroughs with branching decision paths
- **Clinical Decision Support (CDSS)** — Step-by-step clinical simulation with AI reasoning
- **Differential Diagnosis (DDx)** — AI-powered differential diagnosis generator from symptoms
- **Disease Comparison** — Side-by-side comparison of diseases for exam prep
- **Clinical Decision Tree** — Visual decision tree for diagnostic workflows

### 🔬 Advanced Tools
- **3D Anatomy Explorer** — Interactive anatomy visualization with AI-generated medical imagery (Hugging Face)
- **AI Doubt Chat** — Context-aware chatbot for real-time doubt resolution
- **Student Analytics Dashboard** — Visual progress tracking with Chart.js & Recharts

### 🔐 Authentication & Cloud Sync
- Firebase Authentication (Email/Password + Google OAuth)
- Firestore Database for per-user data synchronization
- Firebase Storage for PDF/image uploads
- Session persistence across devices

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, Chart.js, Recharts |
| **AI/ML** | Groq LLM API, Hugging Face Inference API |
| **Backend** | FastAPI (Python), Uvicorn |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Storage** | Firebase Storage |
| **Deployment** | Firebase Hosting |
| **Utilities** | jsPDF, html2canvas, Mammoth.js, PDF.js |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+ (for backend)
- Firebase project configured

### Installation

```bash
# Clone the repository
git clone https://github.com/Sanketh-05/MedGenius.git
cd MedGenius

# Install frontend dependencies
npm install

# Install backend dependencies
cd medgenius-backend
pip install -r requirements.txt
cd ..
```

### Environment Setup

Create a `.env` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_HF_API_KEY=your_huggingface_api_key
```

Create a `.env` file in `medgenius-backend/`:
```env
GROQ_API_KEY=your_groq_api_key
```

### Run the Application

```bash
# Run frontend only
npm run dev

# Run frontend + backend together
npm run dev:all
```

---

## 📁 Project Structure

```
MedGenius/
├── src/
│   ├── components/       # Reusable UI components (Sidebar, DoubtChat, SplashScreen)
│   ├── context/          # React Context (Auth, StudentProgress)
│   ├── data/             # Static data (anatomy data)
│   ├── pages/            # 12+ page components
│   ├── services/         # Hugging Face integration
│   ├── utils/            # AI services, Firestore, file parsing, exports
│   ├── firebase.js       # Firebase configuration
│   └── App.jsx           # Main app with routing
├── medgenius-backend/    # FastAPI backend for AI pipelines
├── public/               # Static assets
├── .gitignore
├── package.json
└── vite.config.js
```

---

## 📸 Modules Overview

| Module | Description |
|--------|-------------|
| Notes Generator | AI-powered medical notes from topics or uploaded files |
| Quiz Engine | Adaptive MCQs with AI explanations |
| Flashcards | Spaced-repetition study cards |
| Clinical Cases | Interactive patient simulations |
| CDSS | Clinical Decision Support System |
| DDx Generator | Differential Diagnosis from symptoms |
| Disease Comparison | Side-by-side disease analysis |
| Anatomy Explorer | Visual anatomy with AI-generated images |
| Analytics Dashboard | Learning progress visualization |
| Doubt Chat | AI chatbot for instant help |

---

## 👨‍💻 Author

**Sanketh Goud Bandari**  
B.E in Computer Science (AI & ML) — MVSR Engineering College  
📧 sgoud0529@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/sanketh-goud-bandari-297b97247)

---

## 📄 License

This project is licensed under the MIT License.
