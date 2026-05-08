const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { fetchTripReport } = require("./fetchTripReport");

const PORT = 8081;
const app = express();

async function readJsonFile(filename) {
  const filePath = path.join(__dirname, filename);
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function appendLog(message) {
  await fs.appendFile(path.join(__dirname, "log.txt"), message);
}

app.get("/fetch", (req, res) => {
  res.sendFile(path.join(__dirname, "fetch.html"));
});

app.get("/fetch-start", (req, res) => {
  const startTime = new Date().toISOString();

  fetchTripReport(3000, async (status) => {
    const logMessage =
      status == null
        ? `${startTime} - Fetching success\n`
        : `${startTime} - Fetching failed: ${status}\n`;

    try {
      await appendLog(logMessage);
    } catch (error) {
      console.error("Failed to append log:", error);
    }

    res.send({ response: logMessage });
  });
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
