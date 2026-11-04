/**
 * Return today's date (or an offset in days) in the browser's local timezone
 * formatted as YYYY-MM-DD. Using toISOString() directly would shift the date
 * for users in positive UTC offsets such as Asia/Jakarta.
 */
export function localDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
