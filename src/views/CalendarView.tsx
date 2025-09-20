import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { dateKey, toInputDate } from '../utils/date'
import type { Task } from '../types'
import { AddTaskModal } from '../components/modals/AddTaskModal'
import { TaskTimerModal } from '../components/modals/TaskTimerModal'
import { DayTasksModal } from '../components/modals/DayTasksModal'

export function CalendarView() {
  const { tasks } = useApp()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [weekAnchor, setWeekAnchor] = useState<Date | null>(new Date())
  const [mode, setMode] = useState<'month'|'week'>('week')

  const map = useMemo(() => groupByDate(tasks), [tasks])
  const weeks = useMemo(() => buildMonthGrid(month), [month])
  const weekDays = useMemo(() => buildWeekGrid(weekAnchor ?? new Date()), [weekAnchor])

  const prev = () => {
    if (mode === 'month') setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
    else setWeekAnchor((d) => addDays(d ?? new Date(), -7))
  }
  const next = () => {
    if (mode === 'month') setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
    else setWeekAnchor((d) => addDays(d ?? new Date(), 7))
  }
  const [addFor, setAddFor] = useState<string | null>(null)
  const [timerTask, setTimerTask] = useState<Task | null>(null)
  const [dayView, setDayView] = useState<string | null>(null)

  const monthLabel = mode === 'month'
    ? month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : weekRangeLabel(weekDays)

  return (
    <section>
      <h2>Calendar</h2>
      <div className="cal-header">
        <button className="btn" onClick={prev}>{'<'}</button>
        <div className="cal-title">{monthLabel}</div>
        <button className="btn" onClick={next}>{'>'}</button>
        <div className="spacer" />
        <div className="cal-toggle">
          <button className={`btn ${mode==='month'?'active':''}`} onClick={() => setMode('month')}>Month</button>
          <button className={`btn ${mode==='week'?'active':''}`} onClick={() => { setMode('week'); setWeekAnchor(new Date()) }}>Week</button>
        </div>
      </div>
      <div className="calendar">
        <div className="cal-row cal-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="cal-cell cal-head">{d}</div>
          ))}
        </div>
        {mode==='month' ? (
          weeks.map((week, i) => (
            <div key={i} className="cal-row">
              {week.map((d, j) => {
                const k = d ? toInputDate(d) : ''
                const list = d ? sortDay(map.get(k) || []) : []
                const isThisMonth = d && d.getMonth() === month.getMonth()
                return (
                  <div key={j} className={`cal-cell ${isThisMonth ? '' : 'cal-dim'}`} onClick={() => d && setDayView(toInputDate(d))}>
                    <div className="cal-date">{d?.getDate() ?? ''}</div>
                    <div className="cal-items">
                      {list.slice(0, 4).map((t) => {
                        const cls = calChipClass(t)
                        return (
                          <div key={t.id} className={`cal-chip ${cls}`} onClick={(e) => { e.stopPropagation(); setTimerTask(t) }}>
                            {timeShort(t)} {t.title}
                          </div>
                        )
                      })}
                      {list.length > 4 && <div className="cal-more">+{list.length - 4} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        ) : (
          <div className="cal-row">
            {weekDays.map((d, j) => {
              const k = toInputDate(d)
              const list = sortDay(map.get(k) || [])
              return (
                <div key={j} className={`cal-cell`} onClick={() => setDayView(k)}>
                  <div className="cal-date">{d.getDate()}</div>
                  <div className="cal-items">
                    {list.slice(0, 6).map((t) => (
                      <div key={t.id} className={`cal-chip ${calChipClass(t)}`} onClick={(e)=>{e.stopPropagation(); setTimerTask(t)}}>
                        {timeShort(t)} {t.title}
                      </div>
                    ))}
                    {list.length > 6 && <div className="cal-more">+{list.length - 6} more</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {addFor && <AddTaskModal onClose={() => setAddFor(null)} initialDueDate={addFor} />}
      {timerTask && <TaskTimerModal task={timerTask} onClose={() => setTimerTask(null)} />}
      {dayView && <DayTasksModal date={dayView} onClose={() => setDayView(null)} />}
    </section>
  )
}

function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const m = new Map<string, Task[]>()
  for (const t of tasks) {
    if (!t.dueDate) continue
    const k = dateKey(t.dueDate)
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(t)
  }
  return m
}

function sortDay(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => timeValue(a) - timeValue(b))
}

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
  // Rules:
  // - Completed on-time => green
  // - Completed late => yellow
  // - Not completed and overdue => red
  // - Not completed and not yet due (or no due) => '' (default/white)
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

function buildMonthGrid(firstOfMonth: Date): (Date | null)[][] {
  const y = firstOfMonth.getFullYear()
  const m = firstOfMonth.getMonth()
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  const weeks: (Date | null)[][] = []
  let current = new Date(first)
  let week: (Date | null)[] = new Array(7).fill(null)
  let startIdx = first.getDay()
  for (let i = 0; i < startIdx; i++) week[i] = null
  while (current <= last) {
    week[current.getDay()] = new Date(current)
    if (current.getDay() === 6) {
      weeks.push(week)
      week = new Array(7).fill(null)
    }
    current.setDate(current.getDate() + 1)
  }
  if (week.some((x) => x !== null)) weeks.push(week)
  return weeks
}

function buildWeekGrid(anchor: Date): Date[] {
  const start = new Date(anchor)
  start.setHours(0,0,0,0)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({length:7}, (_,i)=> new Date(start.getFullYear(), start.getMonth(), start.getDate()+i))
}

function weekRangeLabel(week: Date[]) {
  const first = week[0]
  const last = week[6]
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${first.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}`
}

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x }
