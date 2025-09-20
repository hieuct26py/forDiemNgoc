import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'
import { dateKey, formatDateOnly, isPast, isToday } from '../utils/date'
import type { Task } from '../types'

export function OverdueView() {
  const { tasks } = useApp()
  const [sort, setSort] = useState<'time'|'priority'>('time')

  const grouped = useMemo(() => {
    const overdue = tasks
      .filter((t) => !t.completed && t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate))
      .sort(sort === 'time' ? sortByTime : sortByPriority)

    const map = new Map<string, Task[]>()
    for (const t of overdue) {
      const key = dateKey(t.dueDate as string)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [tasks, sort])

  const keys = useMemo(() => Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b)), [grouped])

  return (
    <section>
      <div className="view-header">
        <h2>Overdue</h2>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="time">By Time</option>
          <option value="priority">By Priority</option>
        </select>
      </div>

      {keys.length === 0 && <div className="empty">All caught up. No overdue tasks!</div>}

      {keys.map((k) => (
        <div key={k} className="group">
          <div className="group-title">{formatDateOnly(k)}</div>
          <TaskList tasks={grouped.get(k)!} showAddRow={false} />
        </div>
      ))}
    </section>
  )
}

function sortByTime(a: Task, b: Task) {
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (at !== bt) return at - bt
  return a.priority - b.priority
}

function sortByPriority(a: Task, b: Task) {
  if (a.priority !== b.priority) return a.priority - b.priority
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  return at - bt
}
