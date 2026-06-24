import { clsx, type ClassValue } from 'clsx';

/** Merge Tailwind classes safely (clsx without twMerge for Tailwind v4) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format ISO date string → "Jan 15, 2025" */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Format ISO date-time → "Jan 15, 2025 · 09:30 AM" */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

/** Format number as currency → "LKR 12,500.00" */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
}

/** Format number with commas → "12,345" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Days until a date (negative = past) */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** True if license/date is expiring within 30 days */
export function isExpiringSoon(dateStr: string, thresholdDays = 30): boolean {
  const days = daysUntil(dateStr);
  return days >= 0 && days <= thresholdDays;
}

/** True if date is already past */
export function isExpired(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

/** Truncate text to maxLen chars */
export function truncate(text: string, maxLen = 40): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** Generate initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
