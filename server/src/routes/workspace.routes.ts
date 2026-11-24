import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadWorkspaceFile, checkStorageQuota, localStorageProvider } from '../middleware/upload.js';
import { config } from '../config.js';

export const workspaceRouter = Router();

function assertWorkspaceOwner(req: Request, ownerId: string) {
  if (!req.user) return false;
  return req.user.id === ownerId || req.user.role === 'ADMIN';
}

// Helper to compute user's storage quota
async function getUserStorageInfo(ownerId: string) {
  const files = await prisma.fileUpload.findMany({
    where: { ownerId },
    select: { sizeBytes: true },
  });

  const usedBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const usedMB = Math.round((usedBytes / (1024 * 1024)) * 100) / 100;
  const maxMB = Math.round((config.maxUserStorageBytes / (1024 * 1024)) * 100) / 100;
  const percent = Math.min(100, Math.round((usedBytes / config.maxUserStorageBytes) * 100));

  return {
    usedBytes,
    usedMB,
    maxMB,
    percent,
    remainingMB: Math.max(0, Math.round((maxMB - usedMB) * 100) / 100),
  };
}

// GET /api/workspace/storage-used
workspaceRouter.get('/storage-used', requireAuth, async (req: Request, res: Response) => {
  try {
    const info = await getUserStorageInfo(req.user!.id);
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute storage usage' });
  }
});

// GET /api/workspace/:ownerId
workspaceRouter.get('/:ownerId', requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string;
    if (!assertWorkspaceOwner(req, ownerId)) {
      return res.status(403).json({ error: 'You can only access your own workspace' });
    }

    const [tasks, notes, links, files] = await Promise.all([
      prisma.task.findMany({ where: { userId: ownerId }, orderBy: { createdAt: 'desc' } }),
      prisma.note.findMany({ where: { userId: ownerId }, orderBy: { updatedAt: 'desc' } }),
      prisma.link.findMany({ where: { userId: ownerId }, orderBy: { createdAt: 'desc' } }),
      prisma.fileUpload.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const quota = await getUserStorageInfo(ownerId);

    res.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        ownerId: t.userId,
        label: t.title,
        sub: t.dueDate || 'Academic Work',
        category: t.category,
        is_done: t.done,
        done: t.done,
      })),
      notes: notes.map((n) => ({
        id: n.id,
        ownerId: n.userId,
        title: n.title,
        content: n.content,
      })),
      links: links.map((l) => ({
        id: l.id,
        ownerId: l.userId,
        title: l.title,
        url: l.url,
      })),
      files: files.map((f) => ({
        id: f.id,
        ownerId: f.ownerId,
        name: f.fileName,
        size: Math.round((f.sizeBytes / (1024 * 1024)) * 100) / 100,
        url: f.url,
      })),
      quota,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch workspace items' });
  }
});

// =================== TASKS ===================
workspaceRouter.post('/:ownerId/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string;
    if (!assertWorkspaceOwner(req, ownerId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { label, title, sub, dueDate, category } = req.body;

    const task = await prisma.task.create({
      data: {
        userId: ownerId,
        title: label || title || 'New Task',
        dueDate: sub || dueDate || null,
        category: category || 'General',
        done: false,
      },
    });

    res.status(201).json({
      id: task.id,
      ownerId: task.userId,
      label: task.title,
      sub: task.dueDate,
      category: task.category,
      is_done: task.done,
      done: task.done,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

workspaceRouter.patch('/tasks/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { is_done, done, label, title, sub, dueDate, category } = req.body;
    const isDoneVal = done !== undefined ? done : is_done;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(isDoneVal !== undefined && { done: isDoneVal }),
        ...(label || title ? { title: label || title } : {}),
        ...(sub || dueDate ? { dueDate: sub || dueDate } : {}),
        ...(category ? { category } : {}),
      },
    });

    res.json({
      id: task.id,
      ownerId: task.userId,
      label: task.title,
      sub: task.dueDate,
      category: task.category,
      is_done: task.done,
      done: task.done,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

workspaceRouter.delete('/tasks/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// =================== NOTES ===================
workspaceRouter.post('/:ownerId/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string;
    const { title, content } = req.body;

    const note = await prisma.note.create({
      data: {
        userId: ownerId,
        title: title || 'Untitled Note',
        content: content || '',
      },
    });

    res.status(201).json({
      id: note.id,
      ownerId: note.userId,
      title: note.title,
      content: note.content,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

workspaceRouter.patch('/notes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, content } = req.body;

    const note = await prisma.note.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    res.json({
      id: note.id,
      ownerId: note.userId,
      title: note.title,
      content: note.content,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

workspaceRouter.delete('/notes/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.note.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// =================== LINKS ===================
workspaceRouter.post('/:ownerId/links', requireAuth, async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string;
    const { title, url } = req.body;

    const link = await prisma.link.create({
      data: {
        userId: ownerId,
        title: title || 'Resource Link',
        url: url || 'https://thapar.edu',
      },
    });

    res.status(201).json({
      id: link.id,
      ownerId: link.userId,
      title: link.title,
      url: link.url,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create link' });
  }
});

workspaceRouter.delete('/links/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.link.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// =================== FILES & 20MB QUOTA ===================
workspaceRouter.post('/:ownerId/files', requireAuth, checkStorageQuota, uploadWorkspaceFile.single('file'), async (req: Request, res: Response) => {
  try {
    const ownerId = req.params.ownerId as string;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = await prisma.fileUpload.create({
      data: {
        ownerId,
        fileName: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype || 'application/octet-stream',
      },
    });

    res.status(201).json({
      id: file.id,
      ownerId: file.ownerId,
      name: file.fileName,
      size: Math.round((file.sizeBytes / (1024 * 1024)) * 100) / 100,
      url: file.url,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

workspaceRouter.delete('/files/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const file = await prisma.fileUpload.findUnique({ where: { id } });
    if (!file) return res.status(404).json({ error: 'File not found' });

    await localStorageProvider.deleteFile(file.url);
    await prisma.fileUpload.delete({ where: { id } });

    res.json({ success: true, message: 'File deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// =================== DIRECT CRUD ALIASES FOR CURRENT USER ===================
workspaceRouter.get('/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({ where: { userId: req.user!.id }, orderBy: { updatedAt: 'desc' } });
    res.json(notes.map((n) => ({ id: n.id, ownerId: n.userId, title: n.title, content: n.content })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

workspaceRouter.post('/notes', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const note = await prisma.note.create({
      data: { userId: req.user!.id, title: title || 'Untitled Note', content: content || '' },
    });
    res.status(201).json({ id: note.id, ownerId: note.userId, title: note.title, content: note.content });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

workspaceRouter.get('/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
    res.json(tasks.map((t) => ({ id: t.id, ownerId: t.userId, label: t.title, sub: t.dueDate, category: t.category, is_done: t.done, done: t.done })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

workspaceRouter.post('/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const { label, title, sub, dueDate, category } = req.body;
    const task = await prisma.task.create({
      data: { userId: req.user!.id, title: label || title || 'New Task', dueDate: sub || dueDate || null, category: category || 'General', done: false },
    });
    res.status(201).json({ id: task.id, ownerId: task.userId, label: task.title, sub: task.dueDate, category: task.category, is_done: task.done, done: task.done });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

workspaceRouter.get('/links', requireAuth, async (req: Request, res: Response) => {
  try {
    const links = await prisma.link.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' } });
    res.json(links.map((l) => ({ id: l.id, ownerId: l.userId, title: l.title, url: l.url })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

workspaceRouter.post('/links', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, url } = req.body;
    const link = await prisma.link.create({
      data: { userId: req.user!.id, title: title || 'Resource Link', url: url || 'https://thapar.edu' },
    });
    res.status(201).json({ id: link.id, ownerId: link.userId, title: link.title, url: link.url });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create link' });
  }
});

workspaceRouter.get('/files', requireAuth, async (req: Request, res: Response) => {
  try {
    const files = await prisma.fileUpload.findMany({ where: { ownerId: req.user!.id }, orderBy: { createdAt: 'desc' } });
    res.json(files.map((f) => ({ id: f.id, ownerId: f.ownerId, name: f.fileName, size: Math.round((f.sizeBytes / (1024 * 1024)) * 100) / 100, url: f.url })));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

workspaceRouter.post('/files', requireAuth, checkStorageQuota, uploadWorkspaceFile.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file = await prisma.fileUpload.create({
      data: {
        ownerId: req.user!.id,
        fileName: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype || 'application/octet-stream',
      },
    });
    res.status(201).json({ id: file.id, ownerId: file.ownerId, name: file.fileName, size: Math.round((file.sizeBytes / (1024 * 1024)) * 100) / 100, url: file.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
});
