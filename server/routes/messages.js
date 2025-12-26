// server/routes/messages.js
import { Router } from "express";
export const messagesRouter = Router();

// Almacenamiento en memoria (simple)
const store = {
  messages: [
    { id: 1, role: "assistant", content: "¡Bienvenido! (mensajes en memoria)" },
  ],
};
let nextId = 2;

// GET /api/messages
messagesRouter.get("/", (req, res) => {
  res.json({ items: store.messages });
});

// POST /api/messages  { role, content }
messagesRouter.post("/", (req, res, next) => {
  try {
    const { role, content } = req.body || {};
    if (!role || !content || typeof content !== "string") {
      const err = new Error("role y content son requeridos");
      err.status = 400;
      throw err;
    }
    if (!["user", "assistant"].includes(role)) {
      const err = new Error("role inválido (user|assistant)");
      err.status = 400;
      throw err;
    }
    const msg = { id: nextId++, role, content };
    store.messages.push(msg);
    res.status(201).json({ item: msg });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/messages/:id
messagesRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = store.messages.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Mensaje no encontrado" });
  const [deleted] = store.messages.splice(idx, 1);
  res.json({ deleted });
});

// DELETE /api/messages (todos)
messagesRouter.delete("/", (req, res) => {
  store.messages = [];
  nextId = 1;
  res.json({ ok: true });
});
