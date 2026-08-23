import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-safe slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Format a date string for display
 */
export function formatDate(
  dateStr: string | null | undefined,
  fmt: string = 'MMM yyyy'
): string {
  if (!dateStr) return 'Present'
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

/**
 * Format full date
 */
export function formatFullDate(dateStr: string | null | undefined): string {
  return formatDate(dateStr, 'MMMM d, yyyy')
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

/**
 * Parse a comma-separated string into a trimmed array
 */
export function parseCSV(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Join array to comma-separated string (for form defaults)
 */
export function joinCSV(arr: string[]): string {
  return arr.join(', ')
}

/**
 * Get the year from a date string
 */
export function getYear(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Present'
  try {
    return parseISO(dateStr).getFullYear().toString()
  } catch {
    return dateStr
  }
}

/**
 * Group an array of items by a key
 */
export function groupBy<T>(
  arr: T[],
  key: (item: T) => string
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item)
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

/**
 * Format file size in human-readable form
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Debounce utility
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Category color map for consistent badge colors
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'AI / ML':       'var(--color-accent)',
  'Machine Learning': 'var(--color-accent)',
  'Full Stack':    '#4A7C59',
  'Programming':   '#5B7FA6',
  'Cloud':         '#7B6CAA',
  'Data':          '#A0855A',
  'Cybersecurity': '#8B4444',
  'Hackathon':     '#4A7C70',
  'Tools':         '#666666',
  'Security':      '#8B4444',
  'Other':         '#999999',
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other']
}
