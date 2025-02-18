import React, { useState, useEffect, useRef } from "react";
import "./LiveTranscription.css";

const USE_DUMMY_DATA = true; // trueならダミーデータモード、falseなら実際に通信

export default function LiveTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const mediaRecorder = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    if (!USE_DUMMY_DATA) {
      ws.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received analysis:", data);
        setMessages((prev) => [...prev, data]);
      };

      return () => {
        if (ws.current) ws.current.close();
      };
    } else {
      // ダミーデータを定期的に追加
      const interval = setInterval(() => {
        const dummyData = {
          speaker: "User",
          text: "これはダミーのテキストです",
          sentiment: ["POSITIVE", "NEGATIVE", "NEUTRAL", "MIXED"][Math.floor(Math.random() * 4)],
        };
        setMessages((prev) => [...prev, dummyData]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, []);

  const startRecording = async () => {
    if (USE_DUMMY_DATA) {
      console.log("ダミーモード: 音声録音開始 (実際の録音なし)");
      return;
    }

    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob);

      await fetch(process.env.REACT_APP_S3_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      console.log("Audio uploaded to S3 (subapp_input_s3)");
    };

    mediaRecorder.current.start();
  };

  const stopRecording = () => {
    if (USE_DUMMY_DATA) {
      console.log("ダミーモード: 録音停止 (実際の録音なし)");
      return;
    }
    setIsRecording(false);
    mediaRecorder.current.stop();
  };

  const getEmoji = (sentiment) => {
    switch (sentiment) {
      case "POSITIVE": return "😊";
      case "NEGATIVE": return "😡";
      case "NEUTRAL": return "😐";
      case "MIXED": return "🤔";
      default: return "❓";
    }
  };

  return (
    <div className="container">
      <h1 className="title">音声録音 & 感情分析 ({USE_DUMMY_DATA ? "ダミーモード" : "通信モード"})</h1>
      <button onClick={isRecording ? stopRecording : startRecording} className={`record-button ${isRecording ? "stop" : "start"}`}>
        {isRecording ? "録音停止" : "録音開始"}
      </button>
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="emoji">{getEmoji(msg.sentiment)}</span>
            <p className="text">{msg.speaker}: {msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
