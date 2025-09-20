import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import type { Task } from '../types'
import { TaskInfoModal } from './modals/TaskInfoModal'

export function NotificationBar() {
  const { tasks, getActualMs } = useApp()
  const [permissionAsked, setPermissionAsked] = useState(false)
  const [notified, setNotified] = useState<Set<string>>(new Set())

  const coef = useMemo(() => {
    const done = tasks.filter((t) => t.completed && t.estimatedMinutes && (t.accumulatedMs || t.timerStartedAt))
    if (done.length === 0) return 1.2
    const ratios = done.map((t) => {
      const actual = (t.accumulatedMs ?? 0)
      const est = (t.estimatedMinutes ?? 1) * 60_000
      return est > 0 ? Math.max(0.5, Math.min(3, actual / est)) : 1
    })
    const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length
    return Math.max(1, Math.min(2.5, avg))
  }, [tasks])

  const warnings = useMemo(() => {
    const list: { id: string; title: string }[] = []
    const now = Date.now()
    for (const t of tasks) {
      if (t.completed || !t.dueDate || !t.estimatedMinutes) continue
      if (!t.dueDate.includes('T')) continue // only precise deadlines
      const due = new Date(t.dueDate).getTime()
      if (due <= now) continue
      const remainingWork = Math.max(0, t.estimatedMinutes * 60_000 - getActualMs(t))
      if (now + remainingWork * coef > due) {
        list.push({ id: t.id, title: t.title })
      }
    }
    return list.slice(0, 3)
  }, [tasks, coef, getActualMs])

  useEffect(() => {
    if (!permissionAsked && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().finally(() => setPermissionAsked(true))
    }
  }, [permissionAsked])

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    for (const w of warnings) {
      if (!notified.has(w.id)) {
        const n = new Notification('Start now or you will be late', { body: w.title })
        setNotified(new Set(notified).add(w.id))
        setTimeout(() => n.close(), 5000)
      }
    }
  }, [warnings, notified])

  const [selected, setSelected] = useState<Task | null>(null)
  if (warnings.length === 0) return null
  return (
    <>
      <div className="notif">
        <span>Start now or you'll be late:</span>
        {warnings.map((w) => (
          <button
            key={w.id}
            className="notif-chip"
            onClick={() => setSelected(tasks.find((t) => t.id === w.id) || null)}
          >
            {w.title}
          </button>
        ))}
      </div>
      {selected && <TaskInfoModal task={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

