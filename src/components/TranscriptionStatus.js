import React, { useEffect, useState } from "react";

const USE_DUMMY_DATA = true; // trueならダミーモード、falseなら実際の通信

function TranscriptionStatus() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!USE_DUMMY_DATA) {
      const ws = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };

      return () => ws.close();
    } else {
      // ダミーデータを定期的に追加
      const interval = setInterval(() => {
        const dummyData = {
          speaker: "AI",
          text: "これはダミーの感情分析結果です。",
          sentiment: ["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"][Math.floor(Math.random() * 4)],
        };
        setMessages((prev) => [...prev, dummyData]);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div>
      <h2>感情分析結果 ({USE_DUMMY_DATA ? "ダミーモード" : "通信モード"})</h2>
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
