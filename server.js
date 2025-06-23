// /frontend-framework/server.js

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { memoryCache } from "./framework/utils/request.js";
import fetch from "node-fetch";

// Socket.io:
import { createServer } from "http";
import { Server as SocketIO } from "socket.io";

const app = express();
app.disable("x-powered-by");

const PORT = process.env.PORT || 3000;

// Create HTTP server on top of Express
const httpServer = createServer(app);

// Initialize Socket.io (it's "connected" to httpServer)
const io = new SocketIO(httpServer, {
  cors: { origin: "*" }
});

// Common middleware → caching + CSP 
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // CSP: allow self, inline-scripts, eval and inline-styles 
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline';" +
    "img-src 'self' data: https://picsum.photos https://fastly.picsum.photos https://via.placeholder.com https://jsonplaceholder.typicode.com;" +
    "connect-src 'self' https://wttr.in https://picsum.photos https://jsonplaceholder.typicode.com;"
  );

  next();
});

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- API: proxy to jsonplaceholder ---
app.get("/api/proxy-todo", async (req, res) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const contentType = response.headers.get("content-type") || "application/json";
    const data = await response.json();

    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=300");
    res.set("X-Content-Type-Options", "nosniff");
    return res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// --- API: simple hello ---
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from API!" });
});
app.post("/hello", (req, res) => {
  const { name } = req.body;
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  res.json({ greeting: `Hello, ${name.trim()}!` });
});

// --- API: serve large file for demonstration of download progress ---
app.get("/api/big-file", (req, res) => {
  const filePath = path.join(__dirname, "example", "public", "big-image.jpg");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.setHeader("Content-Type", "image/jpeg");
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

// --- API: file upload emulation (echo) ---
app.post("/api/upload", (req, res) => {
  res.json({ success: true, message: "File received (emulation)" });
});

// --- Middleware for correct MIME types of JavaScript files ---
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  } else if (req.path.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  next();
});

// --- Static: serve public, example, root ---
app.use(express.static(path.join(__dirname, "example", "public")));
app.use(express.static(path.join(__dirname, "example")));
app.use(express.static("."));

// --- Allow Socket.io routes (to bypass catch-all) ---
app.get("/socket.io/*", (req, res, next) => {
  // Do not serve index.html here, give Socket.io handlers to serve the request
  return next();
});

// --- Catch-all: for all other GET → index.html ---
app.get("*", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.sendFile(path.join(__dirname, "example", "index.html"));
});

// --- Socket.io: chat logic ---
io.on("connection", (socket) => {
  console.info(`Socket connected: ${socket.id}`);

  socket.on("chat:message", (msg) => {
    io.emit("chat:new-message", {
      id: socket.id,
      text: msg,
      timestamp: Date.now()
    });
  });

  socket.on("disconnect", () => {
    console.info(`Socket disconnected: ${socket.id}`);
  });
});

// --- Start HTTP server (with Socket.io) ---
httpServer.listen(PORT, () => {
  console.log(`Server (with Socket.io) running at http://localhost:${PORT}`);
});

// --- SIGINT: clearing internal cache and shutting down server ---
process.on("SIGINT", () => {
  console.log("SIGINT received — clearing internal cache and shutting down server…");
  memoryCache.clear();
  process.exit(0);
});
