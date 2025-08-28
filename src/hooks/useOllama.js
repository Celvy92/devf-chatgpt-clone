// src/hooks/useOllama.js
export function useOllama({ model = "deepseek-r1:1.5b", base = "/ollama" } = {}) {
  // Health-check: lista de modelos
  const ping = async () => {
    const url = `${base}/api/tags`;
    console.log("[useOllama] GET", url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ollama no responde (${res.status})`);
    return res.json();
  };

  // Chat con stream: intenta /api/chat; si 404, hace fallback a /api/generate (prompt plano)
  const chat = async ({ messages, onToken }) => {
    // 1) Primer intento: /api/chat (JSONL con {message:{content}})
    try {
      const url = `${base}/api/chat`;
      console.log("[useOllama] POST", url);
      await streamJsonl({
        url,
        body: { model, messages, stream: true },
        pickToken: (json) => json.message?.content ?? "",
        onToken,
      });
      return;
    } catch (e) {
      if (!/404/.test(String(e))) {
        // Si NO es 404, relanza el error
        throw e;
      }
      console.warn("[useOllama] /api/chat devolvió 404, probando /api/generate…");
    }

    // 2) Fallback: /api/generate (JSONL con {response})
    // Unimos messages en un solo prompt simple (user + assistant concatenados)
    const prompt = messages.map(m => {
      const prefix = m.role === "user" ? "User: " : m.role === "assistant" ? "Assistant: " : "System: ";
      return `${prefix}${m.content}`;
    }).join("\n\n");

    const url = `${base}/api/generate`;
    console.log("[useOllama] POST", url);
    await streamJsonl({
      url,
      body: { model, prompt, stream: true },
      pickToken: (json) => json.response ?? "",
      onToken,
    });
  };

  return { ping, chat };
}

/** Utilidad: consume respuesta JSONL (una línea JSON por chunk) y emite tokens */
async function streamJsonl({ url, body, pickToken, onToken }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} en ${url}: ${t}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // conserva línea incompleta

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const tk = pickToken(json);
        if (tk) onToken?.(tk);
      } catch {
        // líneas cortadas; la siguiente vuelta las completa
      }
    }
  }
}
