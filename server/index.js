// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import { logger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/errors.js";
import { chatRouter } from "./routes/chat.js";
import { messagesRouter } from "./routes/messages.js";

const app = express();
// Si 3001 estuviera ocupado, cambia aquí a 3002 y avísame:
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(logger);

// Salud
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "chat-backend", time: new Date().toISOString() });
});

// Rutas
app.use("/api/chat", chatRouter);
app.use("/api/messages", messagesRouter);

// Errores
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Backend Express funcionando en http://localhost:${PORT}`);
});
