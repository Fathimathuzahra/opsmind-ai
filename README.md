# OpsMind AI - Enterprise SOP Neural Brain 🧠

**Completed Internship Project (Weeks 1-4)**

This repository contains the weekly progression of the OpsMind AI project.

## 📂 Project Organization

- **[Week1_Backend_Foundation](/Week1)**: Initial Node.js server with basic in-memory RAG system.
- **[Week2_AI_Database](/Week2)**: Integration of MongoDB Vector Search and Google Gemini AI.
- **[Week3_Frontend](/Week3)**: React Frontend application (Full Stack).
- **[Week4_Production](/Week4)**: Dockerized deployment, Resilience (Offline Mode), and Hybrid Search.

## 🚀 How to Run the Final Version (Week 4)

1. Navigate to Week 4:
   ```bash
   cd Week4
   ```

2. Run with Docker:
   ```bash
   docker-compose up --build
   ```
   
3. Access:
   - Client: `http://localhost:3000`
   - Server: `http://localhost:5000`

## 🔐 Credentials
Ensure you have a `.env` file in `Week4/server/` with:
- `MONGODB_URI`
- `GEMINI_API_KEY`
