import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Ensure styles are available

const FileUpload = ({ onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        setUploading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload success:', response.data);
            alert('File uploaded successfully!');
            if (onUploadComplete) onUploadComplete(response.data);
            setFile(null);
            // Reset input manually if needed, or rely on state
            document.getElementById('file-upload-input').value = '';
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.error || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="card upload-card">
            <h2>Upload Reference PDF</h2>
            <div className="upload-controls">
                <input
                    id="file-upload-input"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="file-input"
                />
                {error && <p className="error-text">{error}</p>}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="btn primary-btn"
                >
                    {uploading ? 'Processing...' : 'Upload PDF'}
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
