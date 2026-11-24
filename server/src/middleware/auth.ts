import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies && req.cookies[config.cookieName]) {
    return req.cookies[config.cookieName];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return undefined;
}

function verifyJwt(token: string): { id: string; role: string } {
  return jwt.verify(token, config.jwtSecret, {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
  }) as { id: string; role: string };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const decoded = verifyJwt(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, status: true },
    });

    if (!user || user.status === 'INACTIVE') {
      return res.status(401).json({ error: 'User account is inactive or not found.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = verifyJwt(token);
    prisma.user
      .findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, status: true },
      })
      .then((user) => {
        if (user && user.status !== 'INACTIVE') {
          req.user = user;
        }
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
