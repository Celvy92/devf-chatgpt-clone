import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// --- Estado + persistencia ---
const LS_KEY = "devf-chat-state-v2"; // nueva clave para invalidar lo viejo

const defaultState = {
  messages: [
    { id: 1, role: "assistant", content: "¡Hola! Soy tu asistente. ¿En qué te ayudo hoy?" },
  ],
  isThinking: false,
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.messages)) return defaultState;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

// --- Actions ---
const ACTIONS = {
  SEND_USER: "SEND_USER",
  ADD_ASSISTANT: "ADD_ASSISTANT",
  CLEAR: "CLEAR",
  SET_THINKING: "SET_THINKING",
};

// --- Reducer ---
function reducer(state, action) {
  switch (action.type) {
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

// --- Provider ---
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persistencia en localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ messages: state.messages }));
  }, [state.messages]);

  // Acciones (backend + utilidades)
  const actions = useMemo(() => {
    return {
      // Limpia solo la UI (deja localStorage con la conversación inicial)
      clear: () => dispatch({ type: ACTIONS.CLEAR }),

      // Limpia UI + borra localStorage
      clearHard: () => {
        localStorage.removeItem(LS_KEY);
        dispatch({ type: ACTIONS.CLEAR });
      },

      // Enviar mensaje al backend
      sendMessage: async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        dispatch({ type: ACTIONS.SEND_USER, payload: trimmed });
        dispatch({ type: ACTIONS.SET_THINKING, payload: true });

        try {
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
          dispatch({
            type: ACTIONS.ADD_ASSISTANT,
            payload: data.reply ?? "Sin respuesta",
          });
        } catch (e) {
          dispatch({
            type: ACTIONS.ADD_ASSISTANT,
            payload: `Error del servidor: ${e.message}`,
          });
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

// --- Hook de consumo ---
export function useChat() {
  const state = useContext(ChatStateCtx);
  const actions = useContext(ChatDispatchCtx);
  if (!state || !actions) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return { ...state, ...actions };
}
