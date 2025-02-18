import React from "react";
import LiveTranscription from "./components/LiveTranscription";
import TranscriptionStatus from "./components/TranscriptionStatus";

const USE_DUMMY_DATA = true; // ダミーモード切り替え

function App() {
  return (
    <div>
      <h1>リアルタイム音声解析アプリ ({USE_DUMMY_DATA ? "ダミーモード" : "通信モード"})</h1>
      <LiveTranscription />
      <TranscriptionStatus />
    </div>
  );
}

export default App;
