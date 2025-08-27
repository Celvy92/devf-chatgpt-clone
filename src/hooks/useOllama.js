export function useOllama({ model = "deepseek-r1:1.5b", base = "/ollama" } = {}) {
  // GET /api/tags: para health-check rápido
  const ping = async () => {
    const res = await fetch(`${base}/api/tags`);
    if (!res.ok) throw new Error(`Ollama no responde (${res.status})`);
    return res.json();
  };

  // POST /api/chat: stream JSONL
  const chat = async ({ messages, onToken }) => {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!res.ok || !res.body) {
      const t = await res.text().catch(() => "");
      throw new Error(`Ollama error ${res.status}: ${t}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Procesa por líneas (JSONL)
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // deja incompleta para la siguiente vuelta

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const tk = json.message?.content ?? "";
          if (tk) onToken?.(tk);
        } catch {
          /* ignora líneas mal cortadas */
        }
      }
    }
  };

  return { ping, chat };
}
