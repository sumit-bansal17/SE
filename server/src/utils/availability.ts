import { prisma } from '../prisma.js';
import { TIME_SLOTS, getDayName, getDayOfWeekIndex } from './slots.js';

export async function computeProfessorAvailability(professorId: string, date: string) {
  const dayIndex = getDayOfWeekIndex(date);
  const dayName = getDayName(dayIndex);

  const prof = await prisma.user.findUnique({
    where: { id: professorId },
    include: {
      professorProfile: {
        include: { officeHours: true, blockedDates: true },
      },
      timetableEntries: {
        where: { day: dayIndex },
      },
    },
  });

  if (!prof || prof.role !== 'PROFESSOR') {
    return null;
  }

  const blocked = prof.professorProfile?.blockedDates.find((b) => b.date === date);
  if (blocked) {
    return {
      professorId,
      date,
      dayName,
      isBlocked: true,
      blockReason: blocked.reason,
      officeHours: prof.professorProfile?.officeHours.filter((oh) => oh.day === dayIndex),
      slots: TIME_SLOTS.map((slot, idx) => ({
        periodIndex: idx,
        timeSlot: slot,
        status: 'BUSY',
        reason: `Professor Blocked: ${blocked.reason}`,
      })),
    };
  }

  const acceptedMeetings = await prisma.meetingRequest.findMany({
    where: {
      professorId,
      date,
      status: 'ACCEPTED',
    },
  });

  const busyClassPeriods = new Set(prof.timetableEntries.map((t) => t.periodIndex));
  const officeHoursToday = prof.professorProfile?.officeHours.filter((oh) => oh.day === dayIndex) || [];

  const slots = TIME_SLOTS.map((slot, idx) => {
    if (busyClassPeriods.has(idx)) {
      const cls = prof.timetableEntries.find((t) => t.periodIndex === idx);
      return {
        periodIndex: idx,
        timeSlot: slot,
        status: 'BUSY',
        reason: `Class: ${cls?.subject || 'Lecture'}`,
      };
    }

    const meeting = acceptedMeetings.find((m) => m.timeSlot === slot);
    if (meeting) {
      return {
        periodIndex: idx,
        timeSlot: slot,
        status: 'BUSY',
        reason: 'Accepted Student Consultation',
      };
    }

    return {
      periodIndex: idx,
      timeSlot: slot,
      status: 'FREE',
      reason: officeHoursToday.length ? 'Office hours / available for booking' : 'Available for Booking',
    };
  });

  return {
    professorId,
    date,
    dayName,
    isBlocked: false,
    slots,
    officeHours: officeHoursToday,
  };
}
