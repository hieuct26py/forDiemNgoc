import { createPortal } from 'react-dom'
import { useMemo, useState } from 'react'
import { useApp } from '../../state/AppState'
import { dateKey, formatDateOnly } from '../../utils/date'
import type { Task } from '../../types'
import { AddTaskModal } from './AddTaskModal'
import { TaskTimerModal } from './TaskTimerModal'

export function DayTasksModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { tasks } = useApp()
  const list = useMemo(() => sortDay(tasks.filter((t) => t.dueDate && dateKey(t.dueDate) === date)), [tasks, date])
  const [adding, setAdding] = useState(false)
  const [timerTask, setTimerTask] = useState<Task | null>(null)
  const title = formatDateOnly(date)
  const completed = list.filter((t) => t.completed).length
  const remaining = list.length - completed

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal day-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="modal-title">{title}</div>
        <div className="modal-body" style={{ paddingTop: 10 }}>
          <div className="day-stats">
            <div className="day-stats-left">{title}</div>
            <div className="day-stats-right">
              <span className="badge green">Done {completed}</span>
              <span className="badge orange">Left {remaining}</span>
            </div>
          </div>
          {list.length === 0 && <div className="empty">No tasks this day.</div>}
          {list.length > 0 && (
            <div className="cal-day-list">
              {list.map((t) => {
                const cls = calChipClass(t)
                return (
                  <button key={t.id} className={`cal-day-row ${cls}`} onClick={() => setTimerTask(t)}>
                    <span className="cal-day-time">{timeShort(t) || '—'}</span>
                    <span className="cal-day-title">{t.title}</span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="form-row right">
            <button className="primary-btn" onClick={() => setAdding(true)}>+ Add a task</button>
          </div>
        </div>
        {adding && <AddTaskModal onClose={() => setAdding(false)} initialDueDate={date} />}
        {timerTask && <TaskTimerModal task={timerTask} onClose={() => setTimerTask(null)} />}
      </div>
    </div>,
    document.body,
  )
}

function sortDay(tasks: Task[]): Task[] { return [...tasks].sort((a,b) => timeValue(a) - timeValue(b)) }

function timeShort(t: Task): string {
  if (!t.dueDate || !t.dueDate.includes('T')) return ''
  const d = new Date(t.dueDate)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}
function timeValue(t: Task): number {
  if (!t.dueDate) return Number.POSITIVE_INFINITY
  const d = new Date(t.dueDate.includes('T') ? t.dueDate : t.dueDate + 'T23:59:59')
  return d.getTime()
}
function calChipClass(t: Task): string {
  if (t.completed) {
    if (t.dueDate && t.completedAt) {
      const due = new Date(t.dueDate.includes('T') ? t.dueDate : t.dueDate + 'T23:59:59').getTime()
      const done = new Date(t.completedAt).getTime()
      return done <= due ? 'green' : 'yellow'
    }
    return 'green'
  }
  if (t.dueDate) {
    const due = new Date(t.dueDate.includes('T') ? t.dueDate : t.dueDate + 'T23:59:59').getTime()
    if (Date.now() > due) return 'red'
  }
  return ''
}
