import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const FASTAPI_URL = "http://localhost:8000";

  app.use(express.json());

  // Start FastAPI backend as a child process
  const fastapi = spawn("python", ["main.py"]);
  
  fastapi.stdout.on('data', (data) => {
    console.log(`FastAPI: ${data}`);
  });

  fastapi.stderr.on('data', (data) => {
    console.error(`FastAPI Error: ${data}`);
  });

  let realLogsFallback = [
    { id: "init-1", timestamp: Date.now(), level: "Info", message: "Bridge initialized. Connecting to FastAPI IDS Engine..." }
  ];

  // API Routes - Forwarding to FastAPI
  app.get("/api/mode", (req, res) => {
    res.json({ mode: "Real" });
  });

  app.get("/api/devices", async (req, res) => {
    try {
      const response = await axios.get(`${FASTAPI_URL}/api/devices`);
      const scanResults = response.data;
      
      if (Array.isArray(scanResults)) {
        const mapped = scanResults.map((d: any, i: number) => ({
          id: `real-scan-${d.mac || i}`,
          mac: d.mac,
          ip: d.ip,
          ssid: d.ssid || "Unknown Network",
          vendor: d.vendor || "Unknown Vendor",
          rssi: d.rssi || -50,
          status: d.status || "Unknown",
          firstSeen: Date.now(),
          lastSeen: Date.now(),
          behavior: { connectionTimes: [], dataTransmitted: 0 },
          behaviorProfile: { established: false, avgConnectionHour: null, stdDevConnectionHour: null, avgDataPerTick: null },
          threatScore: 0,
          deviceType: "Network Device",
          rssiHistory: [-50],
          isBlocked: false,
          location: "Local Segment",  
          statusHistory: []
        }));
        return res.json(mapped);
      }
      res.json([]);
    } catch (error) {
      console.error("FastAPI unreachable, returning empty list.");
      res.json([]);
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const response = await axios.get(`${FASTAPI_URL}/api/logs`);
      res.json(response.data);
    } catch (error) {
      res.json(realLogsFallback);
    }
  });

  // Email test proxy - forwards to FastAPI
  app.post("/api/email/test", async (req, res) => {
    try {
      const response = await axios.post(`${FASTAPI_URL}/api/email/test`, req.body);
      res.json(response.data);
    } catch (error: any) {
      res.status(500).json({ 
        status: "error", 
        message: error.response?.data?.message || error.message 
      });
    }
  });

  // Email alert proxy - forwards to FastAPI with better error logging
  app.post("/api/email/alert", async (req, res) => {
    try {
      const response = await axios.post(`${FASTAPI_URL}/api/email/alert`, req.body);
      res.json(response.data);
    } catch (error: any) {
      console.error("FastAPI alert dispatch failed:", error?.response?.data || error?.message || error);
      res.status(500).json({ status: "error", detail: error?.response?.data || error?.message || "Internal server error connecting to Python Engine" });
    }
  });

  app.post("/api/devices/block", async (req, res) => {
    const { id } = req.body;
    try {
      await axios.post(`${FASTAPI_URL}/api/devices/block?mac=${id}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
