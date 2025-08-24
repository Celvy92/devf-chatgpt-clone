import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", content: "¡Hola! Soy tu asistente. ¿En qué te ayudo hoy?" },
  ]);

  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: trimmed }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, role: "assistant", content: "¡Recibido! (validación con React Hook Form lista)" }]);
    }, 300);
  };

  return (
    <section className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map(m => <MessageBubble key={m.id} role={m.role} content={m.content} />)}
        <div ref={endRef} />
      </div>
      <div className="border-t border-neutral-200 p-3">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </section>
  );
}
