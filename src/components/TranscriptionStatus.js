import React, { useEffect, useState } from "react";

function TranscriptionStatus() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>感情分析結果</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>{msg.speaker}</strong>: {msg.text}</p>
            <p>感情: {msg.sentiment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TranscriptionStatus;
