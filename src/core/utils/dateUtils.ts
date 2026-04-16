/**
 * MACROSCOPE PERFORMANCE OS - DATE UTILITIES
 * Standardized date comparison and manipulation
 */

export const normalizeDay = (d: Date | string | number): number => {
  const date = new Date(d);
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return normalized.getTime();
};

export const isSameDay = (date1: Date | string | number, date2: Date | string | number): boolean => {
  return normalizeDay(date1) === normalizeDay(date2);
};

export const isToday = (date: Date | string | number): boolean => {
  return isSameDay(date, new Date());
};
