// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // ✅ ahora importa el App correcto
import { ChatProvider } from "./context/ChatContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChatProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
