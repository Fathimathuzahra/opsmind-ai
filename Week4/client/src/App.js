import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

function App() {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧠 OpsMind AI</h1>
        <p>Enterprise SOP Neural Brain</p>
      </header>

      <main className="main-content">
        <div className="left-panel">
          <FileUpload onUploadComplete={fetchDocuments} />

          <div className="card documents-card">
            <h2>Uploaded Documents</h2>
            {documents.length === 0 ? (
              <p>No documents.</p>
            ) : (
              <ul className="doc-list">
                {documents.map((doc, i) => (
                  <li key={i} className="doc-item">
                    📄 {doc.filename}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="right-panel">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

export default App;