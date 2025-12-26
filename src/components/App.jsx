// src/components/App.jsx
import Chat from "./Chat";
import { useChat } from "../context/ChatContext";

export default function App() {
  const { clear } = useChat();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200 p-4 gap-2">
        <div className="text-lg font-semibold">DevF · Chat Clone</div>
        <button
          onClick={clear}
          className="rounded-lg border px-3 py-2 hover:bg-neutral-50"
        >
          + Nuevo chat
        </button>
        <div className="text-sm text-neutral-500 mt-auto">Práctica 3–4</div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="shrink-0 border-b border-neutral-200 p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chat</h1>

          {/* Botón extra de reset en el header por si el sidebar está oculto en móvil */}
          <button
            onClick={clear}
            className="rounded-lg border px-3 py-1.5 hover:bg-neutral-50 md:hidden"
            title="Nuevo chat"
          >
            Limpiar
          </button>
        </header>
        <Chat />
      </main>
    </div>
  );
}
