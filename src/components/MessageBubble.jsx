const roleStyles = {
  user: "bg-blue-600 text-white self-end rounded-t-2xl rounded-bl-2xl",
  assistant: "bg-neutral-200 text-neutral-900 self-start rounded-t-2xl rounded-br-2xl",
};

const roleLabel = {
  user: "Tú",
  assistant: "Asistente",
};

export default function MessageBubble({ role = "assistant", content = "" }) {
  return (
    <div className={`max-w-[85%] md:max-w-[70%] w-fit px-4 py-3 ${roleStyles[role]} shadow-sm`}>
      <div className="text-xs opacity-80 mb-1">{roleLabel[role]}</div>
      <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}
