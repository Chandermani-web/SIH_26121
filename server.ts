/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Healthcheck endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'eRTMAC-NWIS Frontend SPA',
      organization: 'Oil India Limited (OIL)',
      mode: 'Client-Side Hardcoded Intelligence Engine',
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[eRTMAC-NWIS] Frontend Vite server initialized in development mode');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[eRTMAC-NWIS] Serving static frontend from ${distPath}`);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  eRTMAC-NWIS — Nearby Wells Intelligence System   `);
    console.log(`  Frontend-Only Architecture (Hardcoded Intelligence)`);
    console.log(`  App listening on http://0.0.0.0:${PORT}          `);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
