import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route for chat execution
  app.post("/api/chat", async (req, res) => {
    const { messages, baseUrl, model, apiKey, toolsEnabled, currentPlan } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const apiUrl = baseUrl || "https://api.openai.com/v1";
    const apiModel = model || "gpt-4o";

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: apiUrl,
      });

      const { executeAgents } = await import("./src/server/agents");

      await executeAgents({
        openai,
        model: apiModel,
        messages,
        sendEvent,
        toolsEnabled,
        plan: currentPlan
      });

      res.end();
    } catch (error: any) {
      console.error("Chat error:", error);
      sendEvent("error", { message: error.message || "An error occurred" });
      res.end();
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
