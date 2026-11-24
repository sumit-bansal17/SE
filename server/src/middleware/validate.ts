import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        return res.status(400).json({ error: `Validation error: ${messages}`, details: err.issues });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        return res.status(400).json({ error: `Query validation error: ${messages}`, details: err.issues });
      }
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
  };
}
