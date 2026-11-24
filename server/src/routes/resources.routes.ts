import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';

export const resourcesRouter = Router();

const createResourceSchema = z.object({
  title: z.string().min(2, 'Resource title required'),
  category: z.string().optional().default('General'),
  url: z.string().url().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
});

// GET /api/resources
resourcesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query as { search?: string; category?: string };

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (category && category !== 'All' && category !== 'all') {
      where.category = { contains: category };
    }

    const resources = await prisma.resource.findMany({
      where,
      include: { uploadedBy: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources (Professors and Admins only)
resourcesRouter.post('/', requireAuth, requireRole('PROFESSOR', 'ADMIN'), validateBody(createResourceSchema), async (req: Request, res: Response) => {
  try {
    const { title, category, url, fileUrl } = req.body;
    const resource = await prisma.resource.create({
      data: {
        title,
        category: category || 'General',
        url: url || null,
        fileUrl: fileUrl || null,
        uploadedById: req.user!.id,
      },
      include: { uploadedBy: { select: { id: true, name: true, role: true } } },
    });

    res.status(201).json(resource);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// DELETE /api/resources/:id (Professors and Admins only)
resourcesRouter.delete('/:id', requireAuth, requireRole('PROFESSOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const resId = req.params.id as string;
    const existing = await prisma.resource.findUnique({ where: { id: resId } });
    if (!existing) return res.status(404).json({ error: 'Resource not found' });

    if (req.user!.role !== 'ADMIN' && existing.uploadedById !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.resource.delete({ where: { id: resId } });
    res.json({ success: true, message: 'Resource removed' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});
