// server/db.js
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = process.env.DB_FILE || "./db.json";
const dbPath = join(__dirname, DB_FILE);

// Estructura inicial
const defaultData = {
  messages: [
    { id: 1, role: "assistant", content: "¡Bienvenido! (persistencia con LowDB)" },
  ],
};

const adapter = new JSONFile(dbPath);
export const db = new Low(adapter, defaultData);

// Asegura que db.data exista
export async function initDB() {
  await db.read();
  if (!db.data) {
    db.data = structuredClone(defaultData);
    await db.write();
  }
  if (!db.data.messages) {
    db.data.messages = structuredClone(defaultData.messages);
    await db.write();
  }
}

// Helpers
export async function listMessages() {
  await db.read();
  return db.data?.messages ?? [];
}

export async function addMessage({ role, content }) {
  await db.read();
  const msg = { id: nanoid(), role, content };
  db.data.messages.push(msg);
  await db.write();
  return msg;
}

export async function clearMessages() {
  await db.read();
  db.data.messages = structuredClone(defaultData.messages);
  await db.write();
  return db.data.messages;
}
