// src/components/Chat.jsx
import { useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function Chat() {
  const { messages, sendMessage, isThinking } = useChat();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {isThinking && (
          <div className="text-sm text-neutral-500">
            El asistente está pensando…
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-neutral-200 p-3">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={sendMessage} />
        </div>
      </div>
    </section>
  );
}
