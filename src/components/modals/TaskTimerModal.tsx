import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../state/AppState'
import type { Task } from '../../types'

export function TaskTimerModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { startTimer, pauseTimer, addTimeMinutes, getActualMs, toggleTask, tasks } = useApp()
  const [, setNowTick] = useState(Date.now())
  const live = tasks.find((t) => t.id === task.id) || task

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 200)
    return () => clearInterval(id)
  }, [])

  // No auto-start; user must press Start.

  const actualMs = getActualMs(live)
  const estMs = (live.estimatedMinutes ?? 0) * 60_000
  const remaining = Math.max(0, estMs - actualMs)
  const overrun = Math.max(0, actualMs - estMs)
  const running = !!live.timerStartedAt

  const display = formatDuration(remaining > 0 ? remaining : 0)
  const overrunDisplay = overrun > 0 ? formatDuration(overrun) : ''

  const canStart = !running
  const canPause = running

  const inc = (m: number) => addTimeMinutes(live.id, m)
  const toggleComplete = () => toggleTask(live.id)

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="modal-title">Timer — {live.title}</div>
        <div className="modal-body">
          <div className="timer-display">
            <TimerRing remaining={remaining} estMs={estMs} label={display} />
            {overrunDisplay && <div className="time-sub">+{overrunDisplay} overtime</div>}
          </div>

          <div className="form-row center">
            <button className="primary-btn btn-lg" disabled={!canStart} onClick={() => startTimer(live.id)}>Start</button>
            <button className="btn btn-lg" disabled={!canPause} onClick={() => pauseTimer(live.id)}>Pause</button>
          </div>

          <div className="form-row center">
            <button className="btn" onClick={() => inc(5)}>+5m</button>
            <button className="btn" onClick={() => inc(10)}>+10m</button>
            <button className="btn" onClick={() => inc(30)}>+30m</button>
          </div>

          <div className="form-row right" style={{alignItems:'center'}}>
            <button className="success-btn" onClick={toggleComplete}>{live.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function TimerRing({ remaining, estMs, label }: { remaining: number; estMs: number; label: string }) {
  const R = 84
  const STROKE = 12
  const C = 2 * Math.PI * R
  const frac = estMs > 0 ? Math.max(0, Math.min(1, remaining / estMs)) : 0
  const visible = C * frac
  const color = remaining > 0 ? 'var(--accent)' : 'var(--danger)'
  return (
    <div className="timer-ring">
      <svg width={R * 2 + STROKE} height={R * 2 + STROKE} viewBox={`0 0 ${R * 2 + STROKE} ${R * 2 + STROKE}`}>
        <g transform={`translate(${STROKE / 2}, ${STROKE / 2}) rotate(-90 ${R} ${R})`}>
          <circle className="ring-track" cx={R} cy={R} r={R} strokeWidth={STROKE} />
          <circle
            className="ring-progress"
            cx={R}
            cy={R}
            r={R}
            strokeDasharray={`${visible} ${C - visible}`}
            strokeDashoffset={0}
            style={{ stroke: color }}
            strokeWidth={STROKE}
          />
        </g>
      </svg>
      <div className={`ring-label ${remaining === 0 ? 'time-over' : ''}`}>{label}</div>
    </div>
  )
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${m}:${pad(s)}`
}
