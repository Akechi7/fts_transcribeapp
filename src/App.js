import React from "react";
import LiveTranscription from "./components/LiveTranscription";
import TranscriptionStatus from "./components/TranscriptionStatus";

function App() {
  return (
    <div>
      <h1>リアルタイム音声解析アプリ</h1>
      <LiveTranscription />
      <TranscriptionStatus />
    </div>
  );
}

export default App;
