# OpsMind AI - Enterprise SOP Neural Brain 🧠

**Completed Internship Project (Weeks 1-4)**

This repository contains the weekly progression of the OpsMind AI project.

## 📂 Project Organization

- **[Week1_Backend_Foundation](/Week1)**: Initial Node.js server with basic in-memory RAG system.
- **[Week2_AI_Database](/Week2)**: Integration of MongoDB Vector Search and Google Gemini AI.
- **[Week3_Frontend](/Week3)**: React Frontend application (Full Stack).
- **[Week4_Production](/Week4)**: Dockerized deployment, Resilience (Offline Mode), and Hybrid Search.

## 📸 Project Screenshots

**Frontend Interface (localhost:3000)**
![Frontend UI](Screenshot%20(1223).png)

**Backend API Status (localhost:5000)**
![Backend Status](Screenshot%20(1224).png)

## 🚀 How to Run the Final Version (Week 4)

Since Docker is optional, here is how to run the project manually using standard Node.js commands.

### 1. Start the Backend Server
Open your terminal and run:
```bash
cd Week4/server
npm install
npm start
```
*   **Port:** Runs on `http://localhost:5000`
*   **Status:** You should see "Connected to MongoDB" or "In-Memory Mode".

### 2. Start the Frontend Client
Open a **new** terminal window (keep the server running) and run:
```bash
cd Week4/client
npm install
npm start
```
*   **Port:** Runs on `http://localhost:3000`
*   **Action:** The browser will open automatically.

## 🔐 Credentials
Ensure you have a `.env` file in `Week4/server/` with:
- `MONGODB_URI`
- `GEMINI_API_KEY`
