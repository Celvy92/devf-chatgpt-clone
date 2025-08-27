// server/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./middlewares/logger.js";
import { notFound, errorHandler } from "./middlewares/errors.js";
import { initDB, addMessage } from "./db.js";
import { chatRouter } from "./routes/chat.js";
import { messagesRouter } from "./routes/messages.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Rutas
app.get("/", (req, res) => res.send("✅ Backend Express funcionando en http://localhost:3001"));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "chat-backend", time: new Date().toISOString() })
);
app.use("/api/chat", chatRouter);
app.use("/api/messages", messagesRouter);

// 404 + errores
app.use(notFound);
app.use(errorHandler);

// Arranque
const PORT = process.env.PORT || 3001;

const start = async () => {
  await initDB();

  // Mensaje de bienvenida (solo si la DB está “vacía”)
  // (initDB ya se encarga de sembrar uno por defecto si no existe)
  app.listen(PORT, () => {
    console.log(`✅ Backend Express funcionando en http://localhost:${PORT}`);
  });
};

start();
