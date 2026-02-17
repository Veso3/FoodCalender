/**
 * Format date as YYYY-MM-DD in local timezone.
 * Using toISOString() would convert to UTC and can shift the day (e.g. 18th becomes 17th in CET).
 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}
