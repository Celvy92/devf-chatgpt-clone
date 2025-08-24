import { Router } from "express";

export const chatRouter = Router();

function validatePrompt(req, res, next) {
  const { prompt } = req.body || {};
  if (typeof prompt !== "string") return res.status(400).json({ error: "prompt debe ser string" });
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return res.status(400).json({ error: "prompt vacío" });
  if (cleaned.length > 500) return res.status(400).json({ error: "prompt demasiado largo (máx 500)" });
  req.cleanedPrompt = cleaned;
  next();
}

chatRouter.post("/", validatePrompt, async (req, res) => {
  const userPrompt = req.cleanedPrompt;
  const reply = `Eco del server: ${userPrompt.slice(0, 120)}...`;
  res.json({ reply });
});
