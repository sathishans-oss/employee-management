import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const APPS_SCRIPT_URL =
  process.env.GOOGLE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzxS4q-MuhU-_-zrLA1QmQ639bqZwSYhzEoK7V90RhBW21Iq63I6QR-rXqAllr_KsFo7w/exec';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.text({ limit: '10mb' }));

  // API proxy route for Google Apps Script Web App
  app.all('/api/apps-script', async (req, res) => {
    try {
      let bodyData = req.body;
      if (typeof bodyData === 'object') {
        bodyData = JSON.stringify(bodyData);
      } else if (!bodyData) {
        bodyData = JSON.stringify(req.query || {});
      }

      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: bodyData,
        redirect: 'follow',
      });

      const responseText = await response.text();
      res.setHeader('Content-Type', 'application/json');
      res.status(response.status).send(responseText);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[Server Proxy Error]:', errMsg);
      res.status(502).json({
        success: false,
        error: 'Backend proxy error: ' + errMsg,
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
