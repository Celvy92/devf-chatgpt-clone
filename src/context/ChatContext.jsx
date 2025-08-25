// src/context/ChatContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const LS_KEY = "devf-chat-state-v3"; // clave nueva para evitar caché viejo

const defaultState = {
  messages: [
    { id: 1, role: "assistant", content: "¡Hola! Soy tu asistente. ¿En qué te ayudo hoy?" },
  ],
  isThinking: false,
};

// --- Actions ---
const ACTIONS = {
  SET_ALL: "SET_ALL",
  SEND_USER: "SEND_USER",
  ADD_ASSISTANT: "ADD_ASSISTANT",
  CLEAR: "CLEAR",
  SET_THINKING: "SET_THINKING",
};

// --- Reducer ---
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ALL:
      return { ...state, messages: action.payload };
    case ACTIONS.SEND_USER: {
      const msg = { id: Date.now(), role: "user", content: action.payload };
      return { ...state, messages: [...state.messages, msg] };
    }
    case ACTIONS.ADD_ASSISTANT: {
      const msg = { id: Date.now() + 1, role: "assistant", content: action.payload };
      return { ...state, messages: [...state.messages, msg], isThinking: false };
    }
    case ACTIONS.SET_THINKING:
      return { ...state, isThinking: action.payload };
    case ACTIONS.CLEAR:
      return { ...defaultState };
    default:
      return state;
  }
}

// --- Contextos ---
const ChatStateCtx = createContext(null);
const ChatDispatchCtx = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);

  // Persistencia simple para no perder UI si recargas
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ messages: state.messages }));
    } catch (_) {}
  }, [state.messages]);

  // Carga inicial desde backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/messages");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data.items) && data.items.length > 0
          ? data.items
          : defaultState.messages;
        dispatch({ type: ACTIONS.SET_ALL, payload: items });
      } catch (e) {
        console.warn("No se pudo cargar /api/messages, uso defaultState.", e);
        dispatch({ type: ACTIONS.SET_ALL, payload: defaultState.messages });
      }
    })();
  }, []);

  const actions = useMemo(() => {
    return {
      // Limpia backend + estado + localStorage
      clear: async () => {
        try {
          await fetch("/api/messages", { method: "DELETE" });
        } catch (_) {
          // si falla, no bloqueamos el reset local
        }
        try {
          localStorage.removeItem(LS_KEY);
        } catch (_) {}

        dispatch({ type: ACTIONS.SET_THINKING, payload: false });
        dispatch({ type: ACTIONS.SET_ALL, payload: defaultState.messages });
      },

      // Envía mensaje: guarda user -> pide /api/chat -> guarda assistant -> refleja en UI
      sendMessage: async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        // UI inmediata
        dispatch({ type: ACTIONS.SEND_USER, payload: trimmed });
        dispatch({ type: ACTIONS.SET_THINKING, payload: true });

        try {
          // 1) Guarda el mensaje del usuario en backend
          await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "user", content: trimmed }),
          });

          // 2) Pide respuesta al backend
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: trimmed }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          const data = await res.json();
          const replyText = data.reply ?? "Sin respuesta";

          // 3) Guarda respuesta del assistant en backend
          await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "assistant", content: replyText }),
          });

          // 4) Refresca UI (añadir assistant local)
          dispatch({ type: ACTIONS.ADD_ASSISTANT, payload: replyText });
        } catch (e) {
          dispatch({ type: ACTIONS.ADD_ASSISTANT, payload: `Error del servidor: ${e.message}` });
        }
      },
    };
  }, []);

  return (
    <ChatStateCtx.Provider value={state}>
      <ChatDispatchCtx.Provider value={actions}>
        {children}
      </ChatDispatchCtx.Provider>
    </ChatStateCtx.Provider>
  );
}

export function useChat() {
  const state = useContext(ChatStateCtx);
  const actions = useContext(ChatDispatchCtx);
  if (!state || !actions) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return { ...state, ...actions };
}
