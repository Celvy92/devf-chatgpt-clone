// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useOllama } from "../hooks/useOllama";
import ChatInput from "../components/ChatInput";
// Si quieres reactivar el historial luego, importa y colócalo en el layout:
// import History from "../components/History";

export default function Home() {
  console.log("✅ Home.jsx: montando componente");
  const { state, dispatch } = useChat();
  const { threads, activeThreadId } = state;
  const { ping, chat } = useOllama();
  const [status, setStatus] = useState("Comprobando Ollama…");
  const [loading, setLoading] = useState(false);
  const [fatal, setFatal] = useState(null);
  const scrollRef = useRef(null);

  // Asegura hilo al entrar
  useEffect(() => {
    try {
      if (!activeThreadId) {
        console.log("ℹ️ Home: creando hilo inicial");
        dispatch({ type: "NEW_THREAD" });
      }
    } catch (e) {
      console.error("❌ Home: error creando hilo inicial", e);
      setFatal("No se pudo inicializar el hilo");
    }
  }, [activeThreadId, dispatch]);

  // Health-check de Ollama
  useEffect(() => {
    (async () => {
      try {
        const r = await ping();
        console.log("✅ Ollama tags:", r);
        setStatus("Ollama OK");
      } catch (e) {
        console.warn("⚠️ Ollama NO DISPONIBLE:", e);
        setStatus("Ollama NO DISPONIBLE");
      }
    })();
  }, [ping]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId),
    [threads, activeThreadId]
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length]);

  const handleSend = async (text) => {
    if (!activeThread) return;

    // 1) Mensaje del usuario
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "user", content: text },
    });

    // 2) Placeholder del assistant (iremos completando por stream)
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "assistant", content: "" },
    });

    setLoading(true);
    try {
      // Construimos historial incluyendo el nuevo mensaje del usuario
      const messages = activeThread.messages
        .concat({ role: "user", content: text })
        .map((m) => ({ role: m.role, content: m.content }));

      // onToken con filtro de <think>...</think>
      const onToken = (() => {
        let revealed = false; // ¿ya vimos </think>?
        let carry = "";       // buffer hasta encontrar </think>

        return (tk) => {
          if (!revealed) {
            carry += tk;

            // Si aparece un bloque completo <think>...</think>, elimínalo
            // (por si el modelo lo manda de golpe)
            if (/<think>[\s\S]*?<\/think>/.test(carry)) {
              carry = carry.replace(/<think>[\s\S]*?<\/think>/g, "");
              revealed = true;
            } else {
              const closeIdx = carry.indexOf("</think>");
              if (closeIdx === -1) {
                // Aún dentro del <think>…, no mostramos nada
                return;
              }
              // Revela lo que viene después del cierre
              const after = carry.slice(closeIdx + "</think>".length);
              carry = "";
              revealed = true;
              if (after) {
                const cleaned = after.replace(/<think>|<\/think>/g, "");
                if (cleaned) {
                  dispatch({
                    type: "APPEND_TO_LAST_ASSISTANT",
                    id: activeThread.id,
                    chunk: cleaned,
                  });
                }
              }
              return;
            }
          }

          // Ya revelado: limpia cualquier tag suelta o bloques tardíos
          const cleaned = tk
            .replace(/<think>[\s\S]*?<\/think>/g, "")
            .replace(/<think>|<\/think>/g, "");

          if (cleaned) {
            dispatch({
              type: "APPEND_TO_LAST_ASSISTANT",
              id: activeThread.id,
              chunk: cleaned,
            });
          }
        };
      })();

      await chat({ messages, onToken });
    } catch (e) {
      console.error("❌ Error llamando a Ollama:", e);
      dispatch({
        type: "APPEND_TO_LAST_ASSISTANT",
        id: activeThread.id,
        chunk:
          "⚠️ Error con Ollama. ¿Está corriendo y con modelo deepseek-r1:1.5b disponible?",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewThread = () => {
    dispatch({ type: "NEW_THREAD" });
  };

  // --- UI visible y simple ---
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafafa" }}>
      <header style={{ borderBottom: "1px solid #e5e7eb", padding: "16px" }}>
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#111827" }}>
          Clon Chat · Parte 2 (rama-4)
        </h1>
        <div style={{ marginTop: 8, fontSize: 12 }}>
          Estado Ollama:{" "}
          <span style={{ color: status.includes("OK") ? "#059669" : "#dc2626", fontWeight: 600 }}>
            {status}
          </span>
        </div>
      </header>

      {fatal && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12 }}>
          {fatal}
        </div>
      )}

      <div style={{ padding: 16 }}>
        <button
          onClick={handleNewThread}
          style={{
            border: "1px solid #d1d5db",
            background: "white",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          + Nueva conversación
        </button>
      </div>

      <main style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        {!activeThread ? (
          <p style={{ color: "#6b7280" }}>Preparando conversación…</p>
        ) : (
          <>
            {(activeThread.messages ?? []).length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                Escribe un mensaje abajo para comenzar.
              </p>
            ) : (
              (activeThread.messages ?? []).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: 720,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "8px 12px",
                      background: m.role === "user" ? "#111827" : "#ffffff",
                      color: m.role === "user" ? "#ffffff" : "#111827",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #e5e7eb", padding: 16, background: "white" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ChatInput onSend={handleSend} />
          {loading && (
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
              Pensando…
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
