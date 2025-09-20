import { useMemo } from 'react'
import { useApp } from '../state/AppState'

export function AnalyticsView() {
  const { tasks } = useApp()
  const data = useMemo(() => computeStats(tasks), [tasks])
  const weekly = useMemo(() => weeklySeries(tasks), [tasks])
  const score = useMemo(() => computeWeeklyScore(weekly), [weekly])

  return (
    <section>
      <h2>Analytics</h2>

      <div className="analytics-grid">
        <div className="card">
          <div className="card-title">Overview</div>
          <div className="stats-grid">
            <div className="stat"><div className="stat-label">Tasks Completed</div><div className="stat-value">{data.completed}</div></div>
            <div className="stat"><div className="stat-label">Missed Deadlines</div><div className="stat-value">{data.missed}</div></div>
            <div className="stat"><div className="stat-label">Avg Estimation Bias</div><div className="stat-value">{data.bias.toFixed(2)}×</div></div>
            <div className="stat"><div className="stat-label">On-time Rate</div><div className="stat-value">{Math.round(data.onTimeRate*100)}%</div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Weekly Performance</div>
          <div className="chart-legend">
            <span className="legend green"/> On-time
            <span className="legend yellow"/> Late
            <span className="legend red"/> Overdue
          </div>
          <div className="bar-chart">
            {weekly.days.map((d, i) => {
              const w = weekly.data[i]
              const total = Math.max(1, w.onTime + w.late + w.overdue)
              const scale = 100 / weekly.max
              return (
                <div key={d.key} className="bar-group">
                  <div className="bar" style={{ height: `${Math.round((w.onTime + w.late + w.overdue) * scale)}%` }}>
                    <div className="seg green" style={{ height: `${(w.onTime/total)*100}%` }} />
                    <div className="seg yellow" style={{ height: `${(w.late/total)*100}%` }} />
                    <div className="seg red" style={{ height: `${(w.overdue/total)*100}%` }} />
                  </div>
                  <div className="bar-label">{d.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Weekly Score <span className="sub">{rangeLabel(weekly)}</span></div>
          <div className="score-wrap">
            <div className="score-left">
              <div className="score-circle">
                <div className={`score-fill ${score.tier}`} style={{ height: `${score.value}%` }} />
                <div className="score-content">
                  <div className="score-number">{score.value}</div>
                  <div className="score-tier">{score.label}</div>
                </div>
              </div>
              <div className="score-caption">Score</div>
            </div>
            <div className="score-notes">
              <div>On-time: <b className="text-green">{weekly.totals.onTime}</b></div>
              <div>Late: <b className="text-yellow">{weekly.totals.late}</b></div>
              <div>Overdue: <b className="text-red">{weekly.totals.overdue}</b></div>
              <div className="muted">Scoring: +3 on-time, +1 late, -2 overdue</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Insights</div>
          <ul className="insights">
            <li>Realistic time multiplier: <b>{data.multiplier.toFixed(2)}×</b></li>
            <li>Avg overrun per task: <b>{formatMinutes(data.avgOverrunMin)} min</b></li>
            <li>Avg underrun per task: <b>{formatMinutes(data.avgUnderrunMin)} min</b></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

function computeStats(tasks: any[]) {
  const completed = tasks.filter((t: any) => t.completed)
  const withEst = completed.filter((t: any) => t.estimatedMinutes)
  let missed = 0
  let onTime = 0
  const ratios: number[] = []
  const overruns: number[] = []
  const underruns: number[] = []
  for (const t of withEst) {
    const actual = (t.accumulatedMs ?? 0) / 60000
    const est = (t.estimatedMinutes ?? 0)
    if (t.dueDate && t.completedAt) {
      const due = new Date(t.dueDate.includes('T') ? t.dueDate : t.dueDate + 'T23:59:59').getTime()
      const done = new Date(t.completedAt).getTime()
      if (done > due) missed++
      else onTime++
    }
    if (est > 0) {
      const r = Math.max(0.1, Math.min(5, actual / est))
      ratios.push(r)
      const diff = actual - est
      if (diff > 0) overruns.push(diff)
      else underruns.push(-diff)
    }
  }
  const bias = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 1
  const onTimeRate = (onTime + missed) > 0 ? onTime / (onTime + missed) : 1
  const avgOverrunMin = overruns.length ? overruns.reduce((a, b) => a + b, 0) / overruns.length : 0
  const avgUnderrunMin = underruns.length ? underruns.reduce((a, b) => a + b, 0) / underruns.length : 0
  const multiplier = Math.max(1, Math.min(3, bias))
  return { completed: completed.length, missed, bias, onTimeRate, avgOverrunMin, avgUnderrunMin, multiplier }
}

function formatMinutes(n: number): string { return n.toFixed(1) }

function weeklySeries(tasks: any[]) {
  const days: { date: Date; key: string; label: string }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setHours(0,0,0,0)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const label = d.toLocaleDateString(undefined, { weekday: 'short' })
    days.push({ date: d, key, label })
  }
  const data = days.map(() => ({ onTime: 0, late: 0, overdue: 0 }))
  const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x }
  for (const t of tasks) {
    const due = t.dueDate ? new Date(t.dueDate.includes('T') ? t.dueDate : t.dueDate + 'T23:59:59') : null
    const done = t.completedAt ? new Date(t.completedAt) : null
    for (let i = 0; i < days.length; i++) {
      const d = days[i]
      if (done && done >= d.date && done <= endOfDay(d.date)) {
        if (due && done.getTime() > due.getTime()) data[i].late++
        else data[i].onTime++
      }
      if (!t.completed && due && due >= d.date && due <= endOfDay(d.date) && Date.now() > due.getTime()) {
        data[i].overdue++
      }
    }
  }
  const totals = data.reduce((acc, d) => ({
    onTime: acc.onTime + d.onTime,
    late: acc.late + d.late,
    overdue: acc.overdue + d.overdue,
  }), { onTime: 0, late: 0, overdue: 0 })
  const max = Math.max(1, ...data.map(d => d.onTime + d.late + d.overdue))
  return { days, data, max, totals }
}

function computeWeeklyScore(weekly: ReturnType<typeof weeklySeries>) {
  const points = weekly.totals.onTime * 3 + weekly.totals.late * 1 - weekly.totals.overdue * 2
  const maxPossible = (weekly.totals.onTime + weekly.totals.late) * 3 + 1 // avoid 0
  let value = Math.round(Math.max(0, Math.min(100, (points / Math.max(1, maxPossible)) * 100)))
  // tiers
  let tier: 's'|'a'|'b'|'c' = 'c'
  if (value >= 90) tier = 's'
  else if (value >= 75) tier = 'a'
  else if (value >= 60) tier = 'b'
  else tier = 'c'
  const label = tier === 's' ? 'Excellent' : tier === 'a' ? 'Very Good' : tier === 'b' ? 'Good' : 'Keep Going'
  return { value, tier, label }
}

function rangeLabel(weekly: ReturnType<typeof weeklySeries>) {
  const first = weekly.days[0].date
  const last = weekly.days[6].date
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${first.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}`
}
