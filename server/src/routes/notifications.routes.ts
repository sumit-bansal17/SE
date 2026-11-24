import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      notifs.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        is_read: n.isRead,
        isRead: n.isRead,
        link: n.link,
        createdAt: n.createdAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/:userId (backward compatibility)
notificationsRouter.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const notifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      notifs.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        is_read: n.isRead,
        isRead: n.isRead,
        link: n.link,
        createdAt: n.createdAt,
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notification read' });
  }
});

// POST or PATCH /api/notifications/read-all
notificationsRouter.post('/read-all', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

// POST /api/notifications/:userId/read-all (backward compatibility)
notificationsRouter.post('/:userId/read-all', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});
