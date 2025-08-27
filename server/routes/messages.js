// server/routes/messages.js
import { Router } from "express";
import { listMessages, addMessage, clearMessages } from "../db.js";

export const messagesRouter = Router();

// GET /api/messages -> lista de mensajes
messagesRouter.get("/", async (req, res, next) => {
  try {
    const items = await listMessages();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/messages -> agrega un mensaje { role, content }
messagesRouter.post("/", async (req, res, next) => {
  try {
    const { role, content } = req.body || {};
    if (!role || !content) {
      return res.status(400).json({ error: "role y content son requeridos" });
    }
    const created = await addMessage({ role, content });
    res.status(201).json({ item: created });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/messages -> limpia a estado inicial
messagesRouter.delete("/", async (req, res, next) => {
  try {
    const items = await clearMessages();
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
});
