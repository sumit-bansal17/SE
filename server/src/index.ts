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
    contentSecurityPolicy: false,
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

// Paths for static assets and views
const serverPublicDir = path.resolve(process.cwd(), 'server/public');
const clientPublicDir = path.resolve(process.cwd(), 'public');
const viewsDir = path.resolve(process.cwd(), 'server/src/views');

app.use(express.static(serverPublicDir));
app.use(express.static(clientPublicDir));

// OpenAPI specification raw JSON
app.get('/openapi.json', (_req: Request, res: Response) => {
  const openapiPath = path.resolve(process.cwd(), 'openapi.json');
  if (fs.existsSync(openapiPath)) {
    res.sendFile(openapiPath);
  } else {
    res.status(404).json({ error: 'OpenAPI specification not found' });
  }
});

// Interactive API Documentation page
app.get('/docs', (_req: Request, res: Response) => {
  try {
    const template = fs.readFileSync(path.join(viewsDir, 'docs.html'), 'utf-8');
    const html = template
      .replace(/\{\{PORT\}\}/g, String(config.port))
      .replace(/\{\{CLIENT_URL\}\}/g, config.clientUrl || 'http://localhost:3000');
    res.send(html);
  } catch (err) {
    res.redirect('/');
  }
});

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

  try {
    const template = fs.readFileSync(path.join(viewsDir, 'index.html'), 'utf-8');
    const isProduction = process.env.NODE_ENV === 'production';

    const demoAccountsSection = !isProduction
      ? `<div class="info-card">
        <div class="info-card-header header-beige">
          <span class="info-card-label">DEMO USER ACCOUNTS</span>
        </div>
        <div class="info-card-body">
          <ul class="accounts-list">
            <li class="account-item">
              <span class="account-role">Student</span>
              <span class="account-email">student@demo.com</span>
            </li>
            <li class="account-item">
              <span class="account-role">Professor</span>
              <span class="account-email">prof@demo.com</span>
            </li>
            <li class="account-item">
              <span class="account-role">Admin</span>
              <span class="account-email">admin@demo.com</span>
            </li>
          </ul>
          <div class="account-password-note">
            <span>Password:</span>
            <code>password123</code>
          </div>
        </div>
      </div>`
      : '';

    const html = template
      .replace(/\{\{PORT\}\}/g, String(config.port))
      .replace(/\{\{CLIENT_URL\}\}/g, config.clientUrl || 'http://localhost:3000')
      .replace(/\{\{VERSION\}\}/g, '1.0.0')
      .replace(/\{\{ENV\}\}/g, process.env.NODE_ENV || 'development')
      .replace(/\{\{DEMO_ACCOUNTS_SECTION\}\}/g, demoAccountsSection);

    res.send(html);
  } catch (err: any) {
    console.error('Error rendering landing page:', err);
    res.status(500).send('TIET-Sync Academic API Server is active.');
  }
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
  if (req.headers.accept?.includes('text/html')) {
    try {
      const template = fs.readFileSync(path.join(viewsDir, '404.html'), 'utf-8');
      const html = template
        .replace(/\{\{CLIENT_URL\}\}/g, config.clientUrl || 'http://localhost:3000')
        .replace(/\{\{REQUEST_PATH\}\}/g, req.originalUrl);
      return res.status(404).send(html);
    } catch {
      return res.redirect('/');
    }
  }
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found. API routes are under /api/*`,
    frontendUrl: config.clientUrl || 'http://localhost:3000',
  });
});

// Central error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  const status = err.status || 500;

  // API requests and non-HTML requests always receive structured JSON
  if (req.originalUrl.startsWith('/api') || !req.headers.accept?.includes('text/html')) {
    return res.status(status).json({
      error: err.message || 'Internal academic server error',
    });
  }

  try {
    const template = fs.readFileSync(path.join(viewsDir, '500.html'), 'utf-8');
    const html = template
      .replace(/\{\{CLIENT_URL\}\}/g, config.clientUrl || 'http://localhost:3000')
      .replace(/\{\{ERROR_MESSAGE\}\}/g, err.message || 'Internal academic server error');
    return res.status(status).send(html);
  } catch {
    res.status(status).json({
      error: err.message || 'Internal academic server error',
    });
  }
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 [TIET-Sync API] Academic TypeScript Server running on http://localhost:${config.port}`);
  });
}

export default app;
