const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { fetchTripReport } = require("./fetchTripReport");

const PORT = 8081;
const app = express();
const eventClients = new Set();
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://www.johnstottbirdingday.com",
  "https://johnstottbirdingday.com",
]);
const fetchState = {
  isRunning: false,
  startedAt: null,
  finishedAt: null,
  success: null,
  message: "No manual refresh has been started yet.",
  durationSeconds: null,
};
let fetchConsoleLines = [];

async function readJsonFile(filename) {
  const filePath = path.join(__dirname, filename);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

function sendAdminPage(res) {
  res.sendFile(path.join(__dirname, "index.html"));
}

function getFetchStatus() {
  return { ...fetchState };
}

function formatConsoleTimestamp(date = new Date()) {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

function sendEvent(res, eventName, payload) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastEvent(eventName, payload) {
  for (const client of eventClients) {
    sendEvent(client, eventName, payload);
  }
}

app.get("/", (req, res) => {
  sendAdminPage(res);
});

app.get("/fetch", (req, res) => {
  res.redirect(302, "/");
});

app.get("/events", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  eventClients.add(res);
  sendEvent(res, "status", getFetchStatus());
  sendEvent(res, "progress", { lines: fetchConsoleLines });

  try {
    const log = await fs.readFile(path.join(__dirname, "log.txt"), "utf8");
    sendEvent(res, "log", { text: log });
  } catch (error) {
    sendEvent(res, "log", { text: "" });
  }

  req.on("close", () => {
    eventClients.delete(res);
    res.end();
  });
});

app.get("/fetch-start", (req, res) => {
  if (fetchState.isRunning) {
    res.status(409).json({
      ...getFetchStatus(),
      message: "A refresh is already running.",
    });
    return;
  }

  const startTime = new Date().toISOString();
  const startMs = Date.now();

  fetchState.isRunning = true;
  fetchState.startedAt = startTime;
  fetchState.finishedAt = null;
  fetchState.success = null;
  fetchState.durationSeconds = null;
  fetchState.message = "Refreshing race data...";
  fetchConsoleLines = [`${formatConsoleTimestamp()} - Manual refresh started.`];
  broadcastEvent("status", getFetchStatus());
  broadcastEvent("progress", { lines: fetchConsoleLines });

  res.status(202).json(getFetchStatus());

  fetchTripReport(3000, async (status) => {
    const finishedAt = new Date().toISOString();
    const success = status == null;
    const durationSeconds = Math.round((Date.now() - startMs) / 100) / 10;

    fetchState.isRunning = false;
    fetchState.finishedAt = finishedAt;
    fetchState.success = success;
    fetchState.durationSeconds = durationSeconds;
    fetchState.message = success
      ? `Refresh completed successfully in ${durationSeconds}s.`
      : `Refresh failed after ${durationSeconds}s.`;
    fetchConsoleLines = [
      ...fetchConsoleLines,
      success
        ? `${formatConsoleTimestamp()} - Manual refresh completed successfully.`
        : `${formatConsoleTimestamp()} - Manual refresh failed: ${status}`,
    ];

    broadcastEvent("status", getFetchStatus());
    broadcastEvent("progress", { lines: fetchConsoleLines });
    try {
      const log = await fs.readFile(path.join(__dirname, "log.txt"), "utf8");
      broadcastEvent("log", { text: log });
    } catch (error) {
      console.error("Failed to broadcast log:", error);
    }
  }, {
    source: "manual-ui",
    onProgress(message) {
      fetchConsoleLines = [...fetchConsoleLines, message];
      broadcastEvent("progress", { lines: fetchConsoleLines });
    },
  });
});

app.get("/fetch-status", (req, res) => {
  res.json(getFetchStatus());
});

app.get("/user", async (req, res) => {
  try {
    res.json(await readJsonFile("user.json"));
  } catch (error) {
    console.error("Failed to read user.json:", error);
    res.status(500).json({ error: "Failed to read user.json" });
  }
});

app.get("/checklist", async (req, res) => {
  try {
    res.json(await readJsonFile("checklists.json"));
  } catch (error) {
    console.error("Failed to read checklists.json:", error);
    res.status(500).json({ error: "Failed to read checklists.json" });
  }
});

app.get("/info", async (req, res) => {
  try {
    res.json(await readJsonFile("info.json"));
  } catch (error) {
    console.error("Failed to read info.json:", error);
    res.status(500).json({ error: "Failed to read info.json" });
  }
});

app.get("/log", async (req, res) => {
  try {
    const log = await fs.readFile(path.join(__dirname, "log.txt"), "utf8");
    res.send(log);
  } catch (error) {
    console.error("Failed to read log.txt:", error);
    res.status(500).send("Failed to read log.txt");
  }
});

app.listen(PORT, () => console.log(`johnstottbirding app listening on port ${PORT}!`));
