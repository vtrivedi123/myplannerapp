import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Course color palette (soft academic pastels) ──────────
export const COURSE_COLORS = [
  { label: 'Dusty Rose',    value: '#C4748A', bg: 'bg-[#C4748A]', text: 'text-[#C4748A]', light: 'bg-[#F9EEF1]' },
  { label: 'Sage Green',    value: '#7BA68A', bg: 'bg-[#7BA68A]', text: 'text-[#7BA68A]', light: 'bg-[#EEF5F1]' },
  { label: 'Warm Amber',    value: '#D4A853', bg: 'bg-[#D4A853]', text: 'text-[#D4A853]', light: 'bg-[#FBF4E3]' },
  { label: 'Soft Lavender', value: '#9B8EC4', bg: 'bg-[#9B8EC4]', text: 'text-[#9B8EC4]', light: 'bg-[#F2F0FA]' },
  { label: 'Sky Blue',      value: '#6BAED6', bg: 'bg-[#6BAED6]', text: 'text-[#6BAED6]', light: 'bg-[#EAF4FB]' },
  { label: 'Terracotta',    value: '#C47A5A', bg: 'bg-[#C47A5A]', text: 'text-[#C47A5A]', light: 'bg-[#F9EDE6]' },
  { label: 'Dusty Teal',   value: '#5A9E9E', bg: 'bg-[#5A9E9E]', text: 'text-[#5A9E9E]', light: 'bg-[#E6F4F4]' },
  { label: 'Mauve',         value: '#B07BAC', bg: 'bg-[#B07BAC]', text: 'text-[#B07BAC]', light: 'bg-[#F5EDF4]' },
];

export const SEMESTER_COLORS = [
  '#C4748A', '#7BA68A', '#D4A853', '#9B8EC4', '#6BAED6', '#C47A5A',
];

export function getCourseColorEntry(hex: string) {
  return COURSE_COLORS.find(c => c.value === hex) ?? COURSE_COLORS[0];
}

// ── Date helpers ──────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTimeAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const m = minutes;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export function getTodayLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayLocalDate();
}

export function isPast(dateStr: string): boolean {
  return dateStr < getTodayLocalDate();
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function getDueBadge(dateStr: string, completed: boolean): { label: string; className: string } {
  if (completed) return { label: 'Done', className: 'bg-green-100 text-green-700' };
  const days = daysUntil(dateStr);
  if (days < 0) return { label: 'Overdue', className: 'bg-red-100 text-red-600' };
  if (days === 0) return { label: 'Today', className: 'bg-orange-100 text-orange-600' };
  if (days === 1) return { label: 'Tomorrow', className: 'bg-amber-100 text-amber-700' };
  if (days <= 3) return { label: `${days}d`, className: 'bg-yellow-100 text-yellow-700' };
  return { label: `${days}d`, className: 'bg-muted text-muted-foreground' };
}

export const PRIORITY_CONFIG = {
  high:   { label: 'High',   dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600' },
  medium: { label: 'Medium', dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700' },
  low:    { label: 'Low',    dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700' },
};

export const ASSIGNMENT_TYPE_CONFIG = {
  assignment: { label: 'Assignment', emoji: '📝' },
  exam:       { label: 'Exam',       emoji: '📋' },
  project:    { label: 'Project',    emoji: '🗂️' },
  reading:    { label: 'Reading',    emoji: '📖' },
  other:      { label: 'Other',      emoji: '📌' },
};

export const HABIT_CATEGORY_CONFIG = {
  health:   { label: 'Health',   color: '#6BAED6' },
  study:    { label: 'Study',    color: '#C4748A' },
  social:   { label: 'Social',   color: '#9B8EC4' },
  wellness: { label: 'Wellness', color: '#D4A853' },
  fitness:  { label: 'Fitness',  color: '#7BA68A' },
};

// ── Calendar helpers ──────────────────────────────────────
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
