import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config.js';
import { authRouter } from './routes/auth.routes.js';
import { professorsRouter } from './routes/professors.routes.js';
import { classroomsRouter } from './routes/classrooms.routes.js';
import { timetableRouter } from './routes/timetable.routes.js';
import { requestsRouter } from './routes/requests.routes.js';
import { workspaceRouter } from './routes/workspace.routes.js';
import { resourcesRouter } from './routes/resources.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { uploadsDir } from './middleware/upload.js';

const app = express();

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security: Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Security: CORS (Allow frontend origin and credentials)
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development convenience
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Security: Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 requests per 15 min window
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);

// Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// Static files for uploaded attachments and assets
app.use('/uploads', express.static(uploadsDir));

// Root route - Welcome / Status Landing Page
app.get('/', (req: Request, res: Response) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({
      status: 'ok',
      system: 'TIET-Sync Academic API Server',
      port: config.port,
      frontendUrl: config.clientUrl || 'http://localhost:3000',
      healthCheck: '/api/health',
      documentation: 'See README.md and openapi.json for full API specifications',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        professors: '/api/professors',
        classrooms: '/api/classrooms',
        timetable: '/api/timetable',
        requests: '/api/requests',
        workspace: '/api/workspace',
        resources: '/api/resources',
        notifications: '/api/notifications',
        dashboard: '/api/dashboard',
        admin: '/api/admin',
      },
    });
  }

  const frontendUrl = config.clientUrl || 'http://localhost:3000';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIET-Sync Academic API Server | Active</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 680px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .callout {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.05));
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
      text-align: center;
    }
    .callout h2 {
      font-size: 18px;
      font-weight: 700;
      color: #f87171;
      margin-bottom: 8px;
    }
    .callout p {
      font-size: 14px;
      color: #cbd5e1;
      margin-bottom: 18px;
    }
    .btn {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      font-weight: 600;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s ease, transform 0.1s ease;
      box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.4);
    }
    .btn:hover {
      background: #b91c1c;
      transform: translateY(-1px);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
    }
    .box {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 16px;
    }
    .box h3 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .box code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #38bdf8;
      font-size: 13px;
    }
    .box ul {
      list-style: none;
      font-size: 13px;
      color: #cbd5e1;
    }
    .box li {
      margin-bottom: 8px;
    }
    .box li a {
      color: #38bdf8;
      text-decoration: none;
      font-family: ui-monospace, monospace;
      font-size: 12px;
    }
    .box li a:hover {
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span> Backend API Server Operational
    </div>
    <h1>🏛️ TIET-Sync Academic API Server</h1>
    <p>
      The Node.js + Express + TypeScript backend server is running successfully on <strong>port ${config.port}</strong>. All API routes and models are active and connected to the database.
    </p>

    <div class="callout">
      <h2>Looking for the TIET-Sync Web Application?</h2>
      <p>The interactive React Frontend user interface is running on <strong>port 3000</strong>.</p>
      <a href="${frontendUrl}" class="btn">🚀 Open TIET-Sync Web App (Port 3000)</a>
    </div>

    <div class="grid">
      <div class="box">
        <h3>Live API Endpoints</h3>
        <ul>
          <li><a href="/api/health" target="_blank">GET /api/health</a></li>
          <li><a href="/api/professors" target="_blank">GET /api/professors</a></li>
          <li><a href="/api/classrooms" target="_blank">GET /api/classrooms</a></li>
          <li><a href="/api/resources" target="_blank">GET /api/resources</a></li>
        </ul>
      </div>
      <div class="box">
        <h3>Demo User Accounts</h3>
        <ul>
          <li><strong>Student:</strong> <code>student@demo.com</code></li>
          <li><strong>Professor:</strong> <code>prof@demo.com</code></li>
          <li><strong>Admin:</strong> <code>admin@demo.com</code></li>
          <li style="color:#94a3b8; font-size: 11px; margin-top: 6px;">Password: <code>password123</code></li>
        </ul>
      </div>
    </div>

    <div class="footer">
      Thapar Institute of Engineering & Technology &bull; TIET-Sync Engine
    </div>
  </div>
</body>
</html>`;

  res.send(html);
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'TIET-Sync Academic Backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/professors', professorsRouter);
app.use('/api/classrooms', classroomsRouter);
app.use('/api/timetable', timetableRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

// Aliases & Backward Compatibility for frontend endpoints
app.use('/api', timetableRouter); // /api/timetables/:ownerId, /api/timetables/entry
app.use('/api', adminRouter); // /api/students, /api/departments, /api/audit-logs, /api/system/reset
app.use('/api', workspaceRouter); // /api/notes, /api/tasks, /api/links, /api/files, /api/storage-used

// 404 handler for unknown API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Global fallback for any other non-API routes
app.use((req: Request, res: Response) => {
  if (req.accepts('html')) {
    return res.redirect('/');
  }
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found. API routes are under /api/*`,
    frontendUrl: config.clientUrl || 'http://localhost:3000',
  });
});

// Central error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal academic server error',
  });
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 [TIET-Sync API] Academic TypeScript Server running on http://localhost:${config.port}`);
  });
}

export default app;
