import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { ChatProvider } from "./context/ChatContext";
import "./index.css";

console.log("✅ main.jsx: envolviendo con <ChatProvider>");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
