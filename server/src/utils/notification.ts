import { prisma } from '../prisma.js';

interface NotificationParams {
  userId: string;
  type?: string;
  title?: string;
  message: string;
  link?: string;
}

export async function createNotification(params: NotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type || 'INFO',
        title: params.title || 'Notification',
        message: params.message,
        link: params.link || null,
        isRead: false,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
