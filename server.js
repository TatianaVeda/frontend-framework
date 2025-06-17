// // /dot-js/frontend/dot-js/server.js

// import express from "express";
// import cors from "cors";
// import fs from "fs";   
// import path from "path";
// import { fileURLToPath } from "url";
// import { memoryCache } from "./framework/utils/request.js";
// import fetch from "node-fetch";

// // --- Добавили импорты для Socket.io ---
// import { createServer } from "http";
// import { Server as SocketIO } from "socket.io";

// const app = express();
// app.disable("x-powered-by");

// const PORT = process.env.PORT || 3000;

// // --- Создаём HTTP-сервер на базе Express ---
// const httpServer = createServer(app);

// // --- Инициализация Socket.io с разрешением CORS ---
// const io = new SocketIO(httpServer, {
//   cors: { origin: "*" }
// });

// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
//   res.setHeader("Pragma", "no-cache");
//   res.setHeader("Expires", "0");
//   res.setHeader("Surrogate-Control", "no-store");
//   next();
// });

// app.use(cors());
// app.use(express.json());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.get("/api/proxy-todo", async (req, res) => {
//   try {
//     const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
//     const contentType = response.headers.get("content-type") || "application/json";
//     const data = await response.json();

//     res.set("Content-Type", contentType);
//     res.set("Cache-Control", "public, max-age=300");
//     res.set("X-Content-Type-Options", "nosniff");

//     return res.json(data);
//   } catch (err) {
//     console.error("Proxy error:", err);
//     return res.status(500).json({ error: "Proxy error", details: err.message });
//   }
// });

// app.use(express.static(path.join(__dirname, "example", "public")));
// app.use(express.static(path.join(__dirname, "example")));
// app.use(express.static("."));

// app.get("/api/hello", (req, res) => {
//   res.json({ message: "Hello from API!" });
// });

// app.post("/hello", (req, res) => {
//   const { name } = req.body;
//   if (typeof name !== "string" || !name.trim()) {
//     return res.status(400).json({ error: "Name is required" });
//   }
//   res.json({ greeting: `Привет, ${name.trim()}!` });
// });

// // --- Обработка всех остальных GET-запросов отдачей index.html ---
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "example", "index.html"));
// });

// // --- Логика работы Socket.io ---
// io.on("connection", (socket) => {
//   console.info(`Socket connected: ${socket.id}`);

//   // При получении от клиента события 'chat:message' рассылаем всем
//   socket.on("chat:message", (msg) => {
//     io.emit("chat:new-message", {
//       id: socket.id,
//       text: msg,
//       timestamp: Date.now()
//     });
//   });

//   socket.on("disconnect", () => {
//     console.info(`Socket disconnected: ${socket.id}`);
//   });
// });

// // --- Теперь запускаем HTTP-сервер вместо app.listen ---
// httpServer.listen(PORT, () => {
//   console.log(`Server (with Socket.io) running at http://localhost:${PORT}`);
// });

// // Обрабатываем SIGINT для очистки кеша
// process.on("SIGINT", () => {
//   console.log("SIGINT received — очищаем внутренний кеш и завершаем сервер…");
//   memoryCache.clear();
//   process.exit(0);
// });





// // /dot-js/frontend/dot-js/server.js

// import express from "express";
// import cors from "cors";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { memoryCache } from "./framework/utils/request.js";
// import fetch from "node-fetch";

// // --- Добавили импорты для Socket.io ---
// import { createServer } from "http";
// import { Server as SocketIO } from "socket.io";

// const app = express();
// app.disable("x-powered-by");

// const PORT = process.env.PORT || 3000;

// // --- Создаём HTTP-сервер на базе Express ---
// const httpServer = createServer(app);

// // --- Инициализация Socket.io с разрешением CORS ---
// const io = new SocketIO(httpServer, {
//   cors: { origin: "*" }
// });

// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
//   res.setHeader("Pragma", "no-cache");
//   res.setHeader("Expires", "0");
//   res.setHeader("Surrogate-Control", "no-store");
// //Разрешаем inline-стили и inline-скрипты (unsafe-inline) и eval (unsafe-eval)
// res.setHeader(
//   "Content-Security-Policy",
//   "default-src 'self'; " +
//   "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
//   "style-src 'self' 'unsafe-inline';"
// );

//   next();
// });

// app.use(cors());
// app.use(express.json());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // --- Эндпоинт: прокси к jsonplaceholder ---
// app.get("/api/proxy-todo", async (req, res) => {
//   try {
//     const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
//     const contentType = response.headers.get("content-type") || "application/json";
//     const data = await response.json();

//     res.set("Content-Type", contentType);
//     res.set("Cache-Control", "public, max-age=300");
//     res.set("X-Content-Type-Options", "nosniff");

//     return res.json(data);
//   } catch (err) {
//     console.error("Proxy error:", err);
//     return res.status(500).json({ error: "Proxy error", details: err.message });
//   }
// });

// app.use(express.static(path.join(__dirname, "example", "public")));
// app.use(express.static(path.join(__dirname, "example")));
// app.use(express.static("."));

// app.get("/api/hello", (req, res) => {
//   res.json({ message: "Hello from API!" });
// });

// app.post("/hello", (req, res) => {
//   const { name } = req.body;
//   if (typeof name !== "string" || !name.trim()) {
//     return res.status(400).json({ error: "Name is required" });
//   }
//   res.json({ greeting: `Привет, ${name.trim()}!` });
// });

// // --- Эндпоинт: отдача большого файла для демонстрации прогресса скачивания ---
// app.get("/api/big-file", (req, res) => {
//   const filePath = path.join(__dirname, "example", "public", "big-image.jpg");
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ error: "Файл не найден" });
//   }
//   res.setHeader("Content-Type", "image/jpeg");
//   const readStream = fs.createReadStream(filePath);
//   readStream.pipe(res);
// });

// // --- Эндпоинт: приём загруженного файла (эмуляция «echo») ---
// app.post("/api/upload", (req, res) => {
//   // Мы эмулируем загрузку, просто возвращаем { success: true }
//   res.json({ success: true, message: "Файл получен (эмуляция)" });
// });

// // --- Обработка всех остальных GET-запросов отдачей index.html ---
// app.get("*", (req, res) => {
//   res.setHeader("Content-Type", "text/html; charset=utf-8");
//   res.sendFile(path.join(__dirname, "example", "index.html"));
// });


// // --- Логика работы Socket.io ---
// io.on("connection", (socket) => {
//   console.info(`Socket connected: ${socket.id}`);

//   socket.on("chat:message", (msg) => {
//     io.emit("chat:new-message", {
//       id: socket.id,
//       text: msg,
//       timestamp: Date.now()
//     });
//   });

//   socket.on("disconnect", () => {
//     console.info(`Socket disconnected: ${socket.id}`);
//   });
// });


// // --- Запуск HTTP-сервера (вместе с Socket.io) ---
// httpServer.listen(PORT, () => {
//   console.log(`Server (with Socket.io) running at http://localhost:${PORT}`);
// });

// process.on("SIGINT", () => {
//   console.log("SIGINT received — очищаем внутренний кеш и завершаем сервер…");
//   memoryCache.clear();
//   process.exit(0);
// });

// /dot-js/frontend/dot-js/server.js

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

// Создаём HTTP-server поверх Express
const httpServer = createServer(app);

// Инициализируем Socket.io (он «подключен» к httpServer)
const io = new SocketIO(httpServer, {
  cors: { origin: "*" }
});

// Общий middleware → кэширование + CSP
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // CSP: разрешаем self, inline-скрипты, eval и inline-стили
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline';" +
        "img-src 'self' data: https://picsum.photos https://via.placeholder.com https://jsonplaceholder.typicode.com https://images.unsplash.com https://dog.ceo https://cdn2.thecatapi.com; " +
    "connect-src 'self' https://wttr.in https://api.openweathermap.org https://api.weatherapi.com https://api.unsplash.com https://pixabay.com https://picsum.photos https://jsonplaceholder.typicode.com https://dog.ceo https://api.thecatapi.com;"
  );

  next();
});

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- API: прокси к jsonplaceholder ---
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

// --- API: простой hello ---
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from API!" });
});
app.post("/hello", (req, res) => {
  const { name } = req.body;
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  res.json({ greeting: `Привет, ${name.trim()}!` });
});

// --- API: отдача большого файла для демонстрации прогресса скачивания ---
app.get("/api/big-file", (req, res) => {
  const filePath = path.join(__dirname, "example", "public", "big-image.jpg");
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Файл не найден" });
  }
  res.setHeader("Content-Type", "image/jpeg");
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

// --- API: эмуляция загрузки файла (echo) ---
app.post("/api/upload", (req, res) => {
  res.json({ success: true, message: "Файл получен (эмуляция)" });
});

// --- Статика: отдача public, example, корня ---
app.use(express.static(path.join(__dirname, "example", "public")));
app.use(express.static(path.join(__dirname, "example")));
app.use(express.static("."));

// --- Разрешаем Socket.io маршруты (чтобы bypass catch-all) ---
app.get("/socket.io/*", (req, res, next) => {
  // Не отдаём index.html здесь, а даём Socket.io-обработчикам обслужить запрос
  return next();
});

// --- Catch-all: для всех остальных GET → index.html ---
app.get("*", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.sendFile(path.join(__dirname, "example", "index.html"));
});

// --- Socket.io: логика чата ---
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

// --- Запуск HTTP-сервера (с Socket.io) ---
httpServer.listen(PORT, () => {
  console.log(`Server (with Socket.io) running at http://localhost:${PORT}`);
});

// --- При SIGINT очищаем кеш и закрываем ---
process.on("SIGINT", () => {
  console.log("SIGINT received — очищаем внутренний кеш и завершаем сервер…");
  memoryCache.clear();
  process.exit(0);
});
