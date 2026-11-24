import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
export const uploadsDir = path.join(rootDir, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage adapter interface (enables easy swap for S3 / Cloud storage in the future)
export interface StorageProvider {
  saveFile(file: Express.Multer.File): Promise<{ url: string; key: string }>;
  deleteFile(keyOrUrl: string): Promise<boolean>;
}

export const localStorageProvider: StorageProvider = {
  async saveFile(file: Express.Multer.File) {
    return {
      url: `/uploads/${file.filename}`,
      key: file.filename,
    };
  },
  async deleteFile(keyOrUrl: string) {
    try {
      const filename = path.basename(keyOrUrl);
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch {
      return false;
    }
  },
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedBase}_${Date.now()}${ext}`);
  },
});

export const uploadAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Invalid file type. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG'));
    }
    cb(null, true);
  },
});

export const uploadWorkspaceFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per individual file
});

/**
 * Middleware to check user's total 20MB workspace storage quota before accepting file upload
 */
export async function checkStorageQuota(req: Request, res: Response, next: NextFunction) {
  try {
    const rawOwnerId = req.params.ownerId || req.user?.id;
    if (!rawOwnerId) {
      return res.status(400).json({ error: 'User identifier required for storage check' });
    }
    const ownerId = String(rawOwnerId);

    const userFiles = await prisma.fileUpload.findMany({
      where: { ownerId },
      select: { sizeBytes: true },
    });

    const currentTotalBytes = userFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

    // Header Content-Length gives an approximate upper bound before buffering
    const incomingBytes = parseInt(req.headers['content-length'] || '0', 10);

    if (currentTotalBytes + incomingBytes > config.maxUserStorageBytes) {
      const usedMB = (currentTotalBytes / (1024 * 1024)).toFixed(2);
      return res.status(400).json({
        error: `Storage quota exceeded! You have used ${usedMB} MB of your 20.00 MB quota. Delete existing files before uploading more.`,
        usedBytes: currentTotalBytes,
        maxBytes: config.maxUserStorageBytes,
      });
    }

    next();
  } catch (err: any) {
    next(err);
  }
}
