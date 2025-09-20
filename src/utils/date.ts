export function isToday(isoDate: string): boolean {
  const d = new Date(isoDate)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function isPast(isoDate: string): boolean {
  const d = startOfDay(new Date(isoDate))
  const now = startOfDay(new Date())
  return d.getTime() < now.getTime()
}

export function isFuture(isoDate: string): boolean {
  const d = startOfDay(new Date(isoDate))
  const now = startOfDay(new Date())
  return d.getTime() > now.getTime()
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function formatDate(isoDate?: string): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  const datePart = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const timePart = isoDate.includes('T')
    ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
    : ''
  return timePart ? `${datePart} • ${timePart}` : datePart
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dateKey(isoDate: string): string {
  // Normalize to YYYY-MM-DD regardless of time in string.
  const d = new Date(isoDate)
  return toInputDate(d)
}

export function formatDateOnly(isoDate?: string): string {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatTime(isoDate?: string): string {
  if (!isoDate || !isoDate.includes('T')) return ''
  const d = new Date(isoDate)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}
