import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const classroomsRouter = Router();

function formatClassroom(room: any) {
  let amenitiesList: string[] = [];
  try {
    if (room.amenities) {
      amenitiesList = typeof room.amenities === 'string' && room.amenities.startsWith('[')
        ? JSON.parse(room.amenities)
        : room.amenities.split(',').map((s: string) => s.trim());
    }
  } catch {
    amenitiesList = ['Smart Board', 'Air Conditioned'];
  }

  return {
    id: room.id,
    name: room.name,
    block: room.block,
    floor: room.floor,
    capacity: room.capacity,
    code: room.code,
    type: room.type.replace('_', ' '),
    location: room.location || `${room.block} • Room ${room.code}`,
    image: room.imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    imageUrl: room.imageUrl,
    amenities: amenitiesList,
    directions: room.directions || `Navigate to ${room.block}, ${room.floor}. Look for door plate ${room.code}.`,
  };
}

// GET /api/classrooms (search, filter by block or type, sort)
classroomsRouter.get('/', async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { search, block, type, sort } = req.query as { search?: string; block?: string; type?: string; sort?: string };

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { block: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (block && block !== 'All' && block !== 'all') {
      where.block = { contains: block };
    }

    if (type && type !== 'All' && type !== 'all') {
      const normalizedType = type.replace(/\s+/g, '_').toUpperCase();
      where.type = { contains: normalizedType };
    }

    let orderBy: any = { code: 'asc' };
    if (sort === 'capacity_desc') orderBy = { capacity: 'desc' };
    else if (sort === 'capacity_asc') orderBy = { capacity: 'asc' };
    else if (sort === 'name') orderBy = { name: 'asc' };

    const rooms = await prisma.classroom.findMany({
      where,
      orderBy,
    });

    res.json(rooms.map(formatClassroom));
  } catch (err: any) {
    console.error('Error fetching classrooms:', err);
    res.status(500).json({ error: 'Failed to retrieve classroom directory' });
  }
});

// GET /api/classrooms/:id
classroomsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const id = req.params.id as string;
    const room = await prisma.classroom.findUnique({
      where: { id },
      include: {
        timetableEntries: true,
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.json({
      ...formatClassroom(room),
      schedule: room.timetableEntries,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching classroom details' });
  }
});

// POST /api/classrooms (support creating/upserting directly via /api/classrooms)
classroomsRouter.post('/', async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const { name, code, block, floor, capacity, type, imageUrl, amenities, directions, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Classroom name is required' });

    let roomCode = (code || '').trim().toUpperCase();
    if (!roomCode) {
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'ROOM';
      let candidate = `${cleanName}${Math.floor(100 + Math.random() * 900)}`;
      while (await prisma.classroom.findFirst({ where: { code: candidate } })) {
        candidate = `${cleanName}${Math.floor(100 + Math.random() * 9000)}`;
      }
      roomCode = candidate;
    }

    const normalizedType = (type || 'CLASSROOM').replace(/\s+/g, '_').toUpperCase();
    const existing = await prisma.classroom.findFirst({ where: { code: roomCode } });

    let room;
    if (existing) {
      room = await prisma.classroom.update({
        where: { id: existing.id },
        data: {
          name,
          block: block || existing.block,
          floor: floor || existing.floor,
          capacity: capacity !== undefined ? parseInt(String(capacity), 10) : existing.capacity,
          type: normalizedType || existing.type,
          imageUrl: imageUrl || existing.imageUrl,
          location: location || `${block || existing.block} • Room ${roomCode}`,
          amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
          directions: directions || existing.directions,
        },
      });
    } else {
      try {
        room = await prisma.classroom.create({
          data: {
            name,
            code: roomCode,
            block: block || 'Block B',
            floor: floor || 'Ground Floor',
            capacity: parseInt(String(capacity || 60), 10),
            type: normalizedType,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
            location: location || `${block || 'Block B'} • Room ${roomCode}`,
            amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
            directions: directions || `Navigate to ${block}, look for ${roomCode}.`,
          },
        });
      } catch (createErr: any) {
        if (createErr.code === 'P2002') {
          const collision = await prisma.classroom.findFirst({ where: { code: roomCode } });
          if (collision) {
            room = await prisma.classroom.update({
              where: { id: collision.id },
              data: {
                name,
                block: block || collision.block,
                floor: floor || collision.floor,
                capacity: capacity !== undefined ? parseInt(String(capacity), 10) : collision.capacity,
                type: normalizedType || collision.type,
                imageUrl: imageUrl || collision.imageUrl,
                location: location || `${block || collision.block} • Room ${roomCode}`,
                amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
                directions: directions || collision.directions,
              },
            });
          } else {
            const fallbackCode = `${roomCode}-${Math.floor(100 + Math.random() * 900)}`;
            room = await prisma.classroom.create({
              data: {
                name,
                code: fallbackCode,
                block: block || 'Block B',
                floor: floor || 'Ground Floor',
                capacity: parseInt(String(capacity || 60), 10),
                type: normalizedType,
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
                location: location || `${block || 'Block B'} • Room ${fallbackCode}`,
                amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || ['Projector', 'Air Conditioned']),
                directions: directions || `Navigate to ${block}, look for ${fallbackCode}.`,
              },
            });
          }
        } else {
          throw createErr;
        }
      }
    }

    res.status(existing ? 200 : 201).json(formatClassroom(room));
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: `A classroom with code "${req.body.code}" already exists.` });
    }
    res.status(500).json({ error: err.message || 'Failed to save classroom' });
  }
});

// DELETE /api/classrooms/:id
classroomsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.classroom.delete({ where: { id } });
    res.json({ success: true, message: 'Classroom deleted' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
});
