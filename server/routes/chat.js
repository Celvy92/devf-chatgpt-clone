// server/routes/chat.js (handler mínimo de prueba)
import { Router } from "express";

export const chatRouter = Router();

chatRouter.post("/", (req, res) => {
  const { prompt } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt requerido (string)" });
  }
  // Respuesta directa (sin OpenAI, sin DB) para probar estabilidad
  res.json({ reply: `Eco del server: ${prompt}` });
});
