import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'
import { dateKey, formatDateOnly, isFuture, isPast, isToday, toInputDate } from '../utils/date'

export function InboxView({ title = 'All Tasks', search }: { title?: string; search?: string }) {
  const { tasks } = useApp()
  const [sort, setSort] = useState<'time'|'priority'>('time')

  const { today, upcomingMap, nodate, upcomingKeys } = useMemo(() => {
    let arr = tasks.filter((t) => !t.completed)
    if (search) arr = arr.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

    const active = arr.filter((t) => !(t.dueDate && isPast(t.dueDate) && !isToday(t.dueDate)))
    const today = active
      .filter((t) => t.dueDate && isToday(t.dueDate))
      .sort(sort === 'time' ? sortByTime : sortByPriority)
    const nodate = active
      .filter((t) => !t.dueDate)
      .sort(sort === 'time' ? sortByTime : sortByPriority)
    const upcoming = active.filter((t) => t.dueDate && isFuture(t.dueDate))

    const upcomingMap = new Map<string, typeof upcoming>()
    for (const t of upcoming) {
      const k = dateKey(t.dueDate as string)
      if (!upcomingMap.has(k)) upcomingMap.set(k, [])
      upcomingMap.get(k)!.push(t)
    }
    // Ensure sorting applies within each day group
    for (const [k, list] of upcomingMap) {
      list.sort(sort === 'time' ? sortByTime : sortByPriority)
      upcomingMap.set(k, list)
    }
    const upcomingKeys = Array.from(upcomingMap.keys()).sort((a, b) => a.localeCompare(b))

    return { today, upcomingMap, nodate, upcomingKeys }
  }, [tasks, search, sort])

  return (
    <section>
      <div className="view-header">
        <h2>{title}</h2>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="time">By Time</option>
          <option value="priority">By Priority</option>
        </select>
      </div>

      {today.length > 0 && (
        <div className="group">
          <div className="group-title">Today</div>
          <TaskList tasks={today} initialDueDate={toInputDate(new Date())} />
        </div>
      )}

      {upcomingKeys.length > 0 && (
        <div className="group">
          <div className="group-title">Upcoming</div>
          {upcomingKeys.map((k) => (
            <div key={k} className="group" style={{ marginTop: 8 }}>
              <div className="group-title" style={{ textTransform: 'none' }}>{formatDateOnly(k)}</div>
              <TaskList tasks={upcomingMap.get(k)!} initialDueDate={k} />
            </div>
          ))}
        </div>
      )}

      {nodate.length > 0 && (
        <div className="group">
          <div className="group-title">No Due Date</div>
          <TaskList tasks={nodate} />
        </div>
      )}

      {today.length + upcomingKeys.length + nodate.length === 0 && (
        <div className="empty">No tasks yet.</div>
      )}
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
