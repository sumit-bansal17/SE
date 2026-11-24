export const TIME_SLOTS = [
  '8:00-8:50',
  '8:50-9:40',
  '9:40-10:30',
  '10:30-11:20',
  '11:20-12:10',
  '12:10-1:00',
  '1:00-1:50',
  '1:50-2:40',
  '2:40-3:30',
  '3:30-4:20',
  '4:20-5:10',
  '5:10-6:00',
  '6:00-6:50',
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const SLOT_HOURS: Record<string, { start: string; end: string }> = {
  '8:00-8:50': { start: '08:00', end: '08:50' },
  '8:50-9:40': { start: '08:50', end: '09:40' },
  '9:40-10:30': { start: '09:40', end: '10:30' },
  '10:30-11:20': { start: '10:30', end: '11:20' },
  '11:20-12:10': { start: '11:20', end: '12:10' },
  '12:10-1:00': { start: '12:10', end: '13:00' },
  '1:00-1:50': { start: '13:00', end: '13:50' },
  '1:50-2:40': { start: '13:50', end: '14:40' },
  '2:40-3:30': { start: '14:40', end: '15:30' },
  '3:30-4:20': { start: '15:30', end: '16:20' },
  '4:20-5:10': { start: '16:20', end: '17:10' },
  '5:10-6:00': { start: '17:10', end: '18:00' },
  '6:00-6:50': { start: '18:00', end: '18:50' },
};

/**
 * Returns day of week index from 0 (Monday) to 6 (Sunday) for a given YYYY-MM-DD
 */
export function getDayOfWeekIndex(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  const jsDay = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getDayName(dayIndex: number): string {
  return DAYS_OF_WEEK[dayIndex] || 'Monday';
}

export function getSlotStartEnd(slot: string): { start: string; end: string } {
  if (SLOT_HOURS[slot]) return SLOT_HOURS[slot];
  return { start: '09:00', end: '09:50' };
}
