// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useOllama } from "../hooks/useOllama";
import ChatInput from "../components/ChatInput";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Home() {
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
      if (!activeThreadId) dispatch({ type: "NEW_THREAD" });
    } catch (e) {
      console.error(e);
      setFatal("No se pudo inicializar el hilo");
    }
  }, [activeThreadId, dispatch]);

  // Health-check de Ollama
  useEffect(() => {
    (async () => {
      try {
        await ping();
        setStatus("Ollama OK");
      } catch {
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

    // Mensaje del usuario
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "user", content: text },
    });

    // Placeholder del assistant
    dispatch({
      type: "ADD_MESSAGE",
      id: activeThread.id,
      message: { role: "assistant", content: "" },
    });

    setLoading(true);
    try {
      const messages = activeThread.messages
        .concat({ role: "user", content: text })
        .map((m) => ({ role: m.role, content: m.content }));

      // Filtro de <think>...</think>
      const onToken = (() => {
        let revealed = false;
        let carry = "";
        return (tk) => {
          if (!revealed) {
            carry += tk;
            if (/<think>[\s\S]*?<\/think>/.test(carry)) {
              carry = carry.replace(/<think>[\s\S]*?<\/think>/g, "");
              revealed = true;
            } else {
              const closeIdx = carry.indexOf("</think>");
              if (closeIdx === -1) return;
              const after = carry.slice(closeIdx + "</think>".length);
              carry = "";
              revealed = true;
              const cleaned = after.replace(/<think>|<\/think>/g, "");
              if (cleaned) {
                dispatch({
                  type: "APPEND_TO_LAST_ASSISTANT",
                  id: activeThread.id,
                  chunk: cleaned,
                });
              }
              return;
            }
          }
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

  const handleNewThread = () => dispatch({ type: "NEW_THREAD" });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50">
      <header className="border-b border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Clon Chat · Parte 2 (rama-4)</h1>
          <ThemeSwitcher />
        </div>
        <div className="mt-2 text-xs">
          Estado Ollama:{" "}
          <span className={status.includes("OK") ? "text-emerald-600" : "text-red-600"}>
            {status}
          </span>
        </div>
      </header>

      {fatal && (
        <div className="bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200 px-3 py-2">
          {fatal}
        </div>
      )}

      <div className="p-4">
        <button
          onClick={handleNewThread}
          className="border border-neutral-300 bg-white text-neutral-900 
                     rounded-lg px-3 py-2 
                     hover:bg-neutral-100
                     dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700"
        >
          + Nueva conversación
        </button>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {!activeThread ? (
          <p className="text-neutral-500">Preparando conversación…</p>
        ) : (
          <>
            {(activeThread.messages ?? []).length === 0 ? (
              <p className="text-neutral-500">Escribe un mensaje abajo para comenzar.</p>
            ) : (
              (activeThread.messages ?? []).map((m, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[720px] border rounded-xl px-3 py-2 whitespace-pre-wrap
                      ${m.role === "user"
                        ? "bg-neutral-900 text-white border-neutral-800"
                        : "bg-white text-neutral-900 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-50 dark:border-neutral-700"
                      }`}
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

      <footer className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} />
          {loading && <p className="text-xs text-neutral-500 mt-2">Pensando…</p>}
        </div>
      </footer>
    </div>
  );
}
