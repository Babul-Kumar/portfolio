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
 * Normalizes any date string (e.g. "2025", "2025-04", "April 2025", "2025/04/25", ISO string)
 * into a valid PostgreSQL DATE format 'YYYY-MM-DD', or null if invalid/empty.
 * Prevents PostgreSQL error: "invalid input syntax for type date".
 */
export function sanitizeDateForDb(dateStr: string | null | undefined): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null
  const trimmed = dateStr.trim()
  if (!trimmed || ['null', 'undefined', 'present', 'ongoing', 'n/a', 'none'].includes(trimmed.toLowerCase())) {
    return null
  }

  // 1. If strictly valid YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [, m, d] = trimmed.split('-').map(Number)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return trimmed
    }
  }

  // 2. If just a 4-digit year "YYYY" (e.g. "2025")
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01-01`
  }

  // 3. If year-month "YYYY-MM" (e.g. "2025-04")
  if (/^\d{4}-\d{1,2}$/.test(trimmed)) {
    const [y, m] = trimmed.split('-')
    const paddedMonth = m.padStart(2, '0')
    return `${y}-${paddedMonth}-01`
  }

  // 4. If year/month/day with slashes (e.g. "2025/04/25")
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // 5. If day-month-year or month-day-year with slashes/hyphens (e.g. "25/04/2025" or "04/25/2025")
  const partsMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (partsMatch) {
    const p1 = Number(partsMatch[1])
    const p2 = Number(partsMatch[2])
    const year = partsMatch[3]
    if (p1 > 12 && p2 <= 12) {
      return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`
    }
    const month = String(p1).padStart(2, '0')
    const day = String(p2).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 6. If ISO string with time (e.g. "2025-04-25T14:30:00.000Z")
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.slice(0, 10)
  }

  // 7. General date parser (e.g. "April 2025", "15 April 2025", "Apr 2025")
  try {
    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear()
      if (y >= 1970 && y <= 2100) {
        const m = String(parsed.getMonth() + 1).padStart(2, '0')
        const d = String(parsed.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
    }
  } catch {
    // ignore
  }

  return null
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
