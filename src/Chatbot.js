import React from 'react';
import './App.css';

function Chatbot() {
  return (
    <div className="chatbot-container">
      <h2>Salaries Data Insights Chatbot</h2>
      <iframe
        src="http://localhost:8501"
        width="100%"
        height="500px"
        title="Salaries Data Insights Chatbot"
      ></iframe>
    </div>
  );
}

export default Chatbot;
