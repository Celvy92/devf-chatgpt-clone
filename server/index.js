// server/index.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Endpoint Hola Mundo
app.get("/", (req, res) => {
  res.send("Hola, mundo desde Express!");
});

// Endpoint de prueba/health
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "express", time: new Date().toISOString() });
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor Express corriendo en http://localhost:${PORT}`);
});
