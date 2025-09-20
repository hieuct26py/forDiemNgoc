import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import type { Task } from '../types'
import { dateKey, formatDate, isFuture, isToday } from '../utils/date'
import { TaskList } from '../components/TaskList'

export function UpcomingView() {
  const { tasks } = useApp()
  const [sort, setSort] = useState<'time'|'priority'>('time')

  const grouped = useMemo(() => {
    const future = tasks.filter((t) => !t.completed && t.dueDate && (isToday(t.dueDate) || isFuture(t.dueDate)))
    future.sort(sort === 'time' ? sortByTime : sortByPriority)
    const map = new Map<string, Task[]>()
    for (const t of future) {
      const k = dateKey(t.dueDate as string)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(t)
    }
    return map
  }, [tasks, sort])

  const keys = useMemo(() => Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b)), [grouped])

  return (
    <section>
      <div className="view-header">
        <h2>Upcoming</h2>
        <select className="select" value={sort} onChange={(e)=> setSort(e.target.value as any)}>
          <option value="time">By Time</option>
          <option value="priority">By Priority</option>
        </select>
      </div>
      {keys.length === 0 && <div className="empty">No upcoming tasks.</div>}
      {keys.map((k) => (
        <div key={k} className="group">
          <div className="group-title">{formatDate(k)}</div>
          <TaskList tasks={grouped.get(k)!} initialDueDate={k} />
        </div>
      ))}
    </section>
  )
}

function sortByTime(a: any, b: any) {
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (at !== bt) return at - bt
  return a.priority - b.priority
}
function sortByPriority(a: any, b: any) {
  if (a.priority !== b.priority) return a.priority - b.priority
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  return at - bt
}
