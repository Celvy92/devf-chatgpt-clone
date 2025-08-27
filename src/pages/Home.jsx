import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useOllama } from "../hooks/useOllama";
import ChatInput from "../components/ChatInput";
import History from "../components/History";

export default function Home() {
  const { state, dispatch } = useChat();
  const { threads, activeThreadId } = state;
  const { ping, chat } = useOllama();  // incluye health-check
  const [status, setStatus] = useState("Desconectado");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Crear hilo al entrar
  useEffect(() => {
    if (!activeThreadId) dispatch({ type: "NEW_THREAD" });
  }, [activeThreadId, dispatch]);

  // Health-check de Ollama
  useEffect(() => {
    (async () => {
      try {
        await ping();
        setStatus("Ollama OK");
      } catch (e) {
        setStatus("Ollama NO DISPONIBLE");
      }
    })();
  }, [ping]);

  const activeThread = useMemo(
    () => threads.find(t => t.id === activeThreadId),
    [threads, activeThreadId]
  );

  // Auto scroll al final
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  const handleSend = async (text) => {
    if (!activeThread) return;

    // Mensaje del usuario
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "user", content: text }
    });

    // Placeholder del assistant
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "assistant", content: "" }
    });

    setLoading(true);
    try {
      const messages = activeThread.messages
        .concat({ role: "user", content: text })
        .map(m => ({ role: m.role, content: m.content }));

      await chat({
        messages,
        onToken: (tk) => {
          dispatch({
            type: "APPEND_TO_LAST_ASSISTANT",
            id: activeThread.id,
            chunk: tk
          });
        }
      });
    } catch (e) {
      dispatch({
        type: "APPEND_TO_LAST_ASSISTANT",
        id: activeThread.id,
        chunk: "⚠️ Error con Ollama. ¿Está corriendo y con modelo descargado?"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex">
      <History />
      <main className="flex-1 flex flex-col">
        <div className="border-b p-3 text-xs">
          Estado:{" "}
          <span className={status.includes("OK") ? "text-green-600" : "text-red-600"}>
            {status}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(activeThread?.messages ?? []).map((m, idx) => (
            <div
              key={idx}
              className={`max-w-3xl ${m.role === "user" ? "self-end text-right" : "self-start"}`}
            >
              <div className={`inline-block rounded px-4 py-3 border ${
                m.role === "user" ? "bg-black text-white" : "bg-white"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} />
            {loading && <p className="text-xs text-gray-500 mt-2">Pensando…</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
