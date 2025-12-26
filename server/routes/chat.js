// server/routes/chat.js
import { Router } from "express";
export const chatRouter = Router();

chatRouter.post("/", (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Falta el campo prompt" });
  res.json({ reply: `Eco del server: ${prompt}` });
});
