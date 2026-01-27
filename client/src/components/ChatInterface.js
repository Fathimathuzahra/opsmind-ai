import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const ChatInterface = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState([]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setAnswer(null);
        setSources([]);

        try {
            const response = await axios.post('http://localhost:5000/api/ask', { question });
            setAnswer(response.data.answer);
            setSources(response.data.sources || []);
        } catch (err) {
            console.error('Ask error:', err);
            setAnswer('Sorry, something went wrong while fetching the answer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card chat-card">
            <h2>Ask OpsMind AI</h2>

            <form onSubmit={handleAsk} className="chat-form">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="chat-input"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="btn success-btn"
                >
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </form>

            <div className="chat-response-area">
                {answer ? (
                    <div>
                        <div className="answer-content">
                            {answer}
                        </div>
                        {sources.length > 0 && (
                            <div className="sources-container">
                                <p className="sources-title">Sources:</p>
                                <ul className="sources-list">
                                    {sources.map((src, idx) => (
                                        <li key={idx}>
                                            {src.filename} (Relevance: {(src.score * 100).toFixed(1)}%)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="placeholder-text">
                        Ask a question to see the answer here.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
