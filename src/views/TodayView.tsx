import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'
import { isToday, toInputDate } from '../utils/date'

export function TodayView() {
  const { tasks } = useApp()
  const [sort, setSort] = useState<'time'|'priority'>('time')
  const list = useMemo(() => {
    const base = tasks.filter((t) => !t.completed && t.dueDate && isToday(t.dueDate))
    return base.sort(sort === 'time' ? sortByTime : sortByPriority)
  }, [tasks, sort])

  return (
    <section>
      <div className="view-header">
        <h2>Today</h2>
        <select className="select" value={sort} onChange={(e)=> setSort(e.target.value as any)}>
          <option value="time">By Time</option>
          <option value="priority">By Priority</option>
        </select>
      </div>
      <TaskList tasks={list} emptyText="No tasks for today." initialDueDate={toInputDate(new Date())} />
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
