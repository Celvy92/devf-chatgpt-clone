import Chat from "./components/Chat";

export default function App() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200 p-4 gap-2">
        <div className="text-lg font-semibold">DevF · Chat Clone</div>
        <button className="rounded-lg border px-3 py-2 hover:bg-neutral-50">
          + Nuevo chat
        </button>
        <div className="text-sm text-neutral-500 mt-auto">Práctica 1 · parte-1</div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="shrink-0 border-b border-neutral-200 p-4">
          <h1 className="text-xl font-semibold">Chat</h1>
        </header>
        <Chat />
      </main>
    </div>
  );
}
