import React, { useState, useEffect, useRef } from "react";
import "./LiveTranscription.css";

export default function LiveTranscription() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]); // 受信したメッセージを保存
  const mediaRecorder = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    // WebSocket接続を開始
    ws.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received analysis:", data);

      // 受信した感情データを追加
      setMessages((prev) => [...prev, data]);
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const startRecording = async () => {
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

      // S3に音声データをアップロード
      await fetch(process.env.REACT_APP_S3_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      console.log("Audio uploaded to S3 (subapp_input_s3)");
    };

    mediaRecorder.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder.current.stop();
  };

  // 感情分析の結果に応じた顔アイコンを返す関数
  const getEmoji = (sentiment) => {
    switch (sentiment) {
      case "POSITIVE":
        return "😊"; // ポジティブ
      case "NEGATIVE":
        return "😡"; // ネガティブ
      case "NEUTRAL":
        return "😐"; // ニュートラル
      case "MIXED":
        return "🤔"; // 混在
      default:
        return "❓"; // 不明な場合
    }
  };

  return (
    <div className="container">
      <h1 className="title">音声録音 & 感情分析</h1>
      <button onClick={isRecording ? stopRecording : startRecording} className={`record-button ${isRecording ? "stop" : "start"}`}>
        {isRecording ? "録音停止" : "録音開始"}
      </button>

      {/* 受信したメッセージを吹き出し形式で表示 */}
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
