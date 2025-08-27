import { useChat } from "../context/ChatContext";

export default function History() {
  const { state, dispatch } = useChat();
  const { threads, activeThreadId } = state;

  return (
    <aside className="w-72 border-r h-full overflow-y-auto p-3">
      <button
        onClick={() => dispatch({ type: "NEW_THREAD" })}
        className="w-full mb-3 py-2 rounded bg-black text-white hover:opacity-90"
      >
        + Nueva conversación
      </button>

      {threads.length === 0 ? (
        <p className="text-sm text-gray-500">Sin conversaciones.</p>
      ) : (
        <ul className="space-y-1">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => dispatch({ type: "SET_ACTIVE", id: t.id })}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                  t.id === activeThreadId ? "bg-gray-200" : ""
                }`}
                title={t.title}
              >
                <div className="text-sm font-medium truncate">
                  {t.title || "Conversación"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {t.messages.at(-1)?.content || "—"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
