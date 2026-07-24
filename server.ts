import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { adminAssistantHandler, sentimentHandler } from "./api/_lib/gemini";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. Assistente Gerencial da Agenda (/api/gemini/admin-assistant)
  app.post("/api/gemini/admin-assistant", adminAssistantHandler);

  // 2. Análise de Sentimento das Notas do Cliente (/api/gemini/sentiment)
  app.post("/api/gemini/sentiment", sentimentHandler);

  // Integrar Vite Middleware (Dev) ou Arquivos Estáticos (Prod)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
  });
}

startServer();
