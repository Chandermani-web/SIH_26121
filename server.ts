/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/routes/api.js';
import { ertmacSimulator } from './src/server/services/simulatorService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Setup WebSocket Server
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    console.log(`[WebSocket] Client connected on ${url}`);
    ertmacSimulator.registerSocket(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'START_SIMULATION') {
          ertmacSimulator.startSimulation(data.demoMode, data.speed);
        } else if (data.type === 'STOP_SIMULATION') {
          ertmacSimulator.stopSimulation();
        } else if (data.type === 'STEP_DEPTH') {
          ertmacSimulator.stepDepth(data.deltaM || 1.0);
        } else if (data.type === 'PUMP_MITIGATION') {
          ertmacSimulator.pumpMitigationPill(data.pillType);
        } else if (data.type === 'ACK_ALERT') {
          ertmacSimulator.acknowledgeAlert(data.alertId);
        }
      } catch (e) {
        console.error('[WebSocket] Error parsing message:', e);
      }
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Error:', err.message);
    });
  });

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // REST API Routes
  app.use('/api', apiRouter);

  // Healthcheck endpoint
  const getHealthPayload = () => ({
    status: 'HEALTHY',
    service: 'eRTMAC-NWIS Engine',
    version: '1.0.0',
    organization: 'Oil India Limited (OIL)',
    phase: 'PHASE 1: Project Foundation & Operational Intelligence',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: 'PostgreSQL/PostGIS (Synthetic Hybrid Engine)',
      status: 'CONNECTED',
      spatialEngine: 'PostGIS / Haversine Geo-Correlation',
      monitoredWellsCount: 17,
      historicalEventsCount: 65,
    },
    redis: {
      status: 'ACTIVE_PUBSUB',
      channel: 'ertmac:telemetry:live',
    },
    telemetryStream: {
      activeWell: 'NHK-Deep-504',
      status: ertmacSimulator.getState().isRunning ? 'STREAMING' : 'IDLE',
      currentDepth: ertmacSimulator.getState().currentDepth,
    },
    timestamp: new Date().toISOString(),
  });

  app.get('/health', (_req, res) => {
    res.json(getHealthPayload());
  });

  app.get('/api/health', (_req, res) => {
    res.json(getHealthPayload());
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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
    console.log('[eRTMAC-NWIS] Vite middleware initialized in development mode');
  } else {
    // Production mode: Serve built static files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[eRTMAC-NWIS] Serving static bundle from ${distPath}`);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  eRTMAC-NWIS — Nearby Wells Intelligence System   `);
    console.log(`  Organization: Oil India Limited                  `);
    console.log(`  Server listening on http://0.0.0.0:${PORT}       `);
    console.log(`  WebSocket live at ws://0.0.0.0:${PORT}/ws/well/OIL-ACTIVE-01`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
