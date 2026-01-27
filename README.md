# OpsMind AI - Enterprise SOP Neural Brain 🧠

**Completed Internship Project (Weeks 1-4)**

OpsMind AI is a full-stack MERN application (MongoDB, Express, React, Node.js) designed to ingest Enterprise SOP (Standard Operating Procedure) PDFs and allow users to ask questions about them using Retrieval Augmented Generation (RAG) powered by Google Gemini AI.

## 🚀 Features

### ✅ Week 1: Backend Foundation
- Robust Node.js/Express Server.
- Custom PDF Processing & Chunking Engine.

### ✅ Week 2: AI & Persistence
- **MongoDB Integration**: Validated storage for documents.
- **Vector Search**: Semantic search using `text-embedding-004`.
- **RAG**: Intelligent answers using `gemini-1.5-flash`.

### ✅ Week 3: Frontend Interface
- Modern React UI with Drag-and-Drop Upload.
- Real-time Chat Interface with Source Citations.

### ✅ Week 4: Production Hardening
- **Docker Compose**: One-click deployment.
- **Hybrid Search**: Keyword fallback if AI search misses.
- **Failover Modes**: "Offline Mode" (In-Memory DB) and "Direct Quote" fallback to ensure zero-crash reliability.

## 🛠️ How to Run

### Option 1: Docker (Recommended)
Prerequisite: Docker Desktop installed.
```bash
docker-compose up --build
```
Access the app at `http://localhost:3000`.

### Option 2: Manual Setup
**1. Start Backend**
```bash
cd server
npm install
npm start
```

**2. Start Frontend**
```bash
cd client
npm install
npm start
```

## 📂 Project Structure
- **/client**: React Frontend code.
- **/server**: Node.js Backend code.
- **docker-compose.yml**: Container orchestration.

## 🔐 Configuration
The project uses a `.env` file in the `server` directory for:
- `MONGODB_URI`
- `GEMINI_API_KEY`
