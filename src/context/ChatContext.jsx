// src/context/ChatContext.jsx
import { createContext, useContext, useEffect, useReducer } from "react";

const ChatContext = createContext(null);

// Estado inicial
const initialState = {
  threads: [],
  activeThreadId: null,
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case "NEW_THREAD": {
      const id = crypto.randomUUID();
      const thread = { id, title: action.title ?? "Nueva conversación", messages: [] };
      return { ...state, threads: [thread, ...state.threads], activeThreadId: id };
    }
    case "SET_ACTIVE": {
      return { ...state, activeThreadId: action.id };
    }
    case "ADD_MESSAGE": {
      const { id, message } = action;
      const threads = state.threads.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, messages: [...t.messages, message] };
        if (!t.title || t.title === "Nueva conversación") {
          const firstUser = updated.messages.find(m => m.role === "user");
          if (firstUser) updated.title = firstUser.content.slice(0, 40);
        }
        return updated;
      });
      return { ...state, threads };
    }
    case "APPEND_TO_LAST_ASSISTANT": {
      const { id, chunk } = action;
      const threads = state.threads.map(t => {
        if (t.id !== id) return t;
        const msgs = t.messages.slice();
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "assistant") {
            msgs[i] = { ...msgs[i], content: (msgs[i].content || "") + chunk };
            break;
          }
        }
        return { ...t, messages: msgs };
      });
      return { ...state, threads };
    }
    case "CLEAR_ALL": {
      return initialState;
    }
    default:
      return state;
  }
}

// Carga segura desde localStorage (sin fetch)
function loadState() {
  try {
    const raw = localStorage.getItem("chat_state_v1");
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    // Validación mínima
    if (!parsed || typeof parsed !== "object") return initialState;
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      activeThreadId: parsed.activeThreadId ?? null,
    };
  } catch {
    return initialState;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Guarda en localStorage cuando cambie el estado
  useEffect(() => {
    try {
      localStorage.setItem("chat_state_v1", JSON.stringify(state));
    } catch {
      // ignorar errores de storage
    }
  }, [state]);

  const value = { state, dispatch };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de <ChatProvider/>");
  return ctx;
}
