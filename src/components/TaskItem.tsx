import { useMemo, useState } from 'react'
import { useApp } from '../state/AppState'
import { useConfirm } from '../ui/Confirm'
import type { Task } from '../types'
import { formatDateOnly, formatTime } from '../utils/date'
import { AddTaskModal } from './modals/AddTaskModal'
import { TaskTimerModal } from './modals/TaskTimerModal'
import { CheckCircleIcon } from '../assets/icons'

export function TaskItem({ task }: { task: Task }) {
  const { toggleTask, deleteTask, projects, labels } = useApp()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(false)
  const [showTimer, setShowTimer] = useState(false)

  const project = useMemo(() => projects.find((p) => p.id === task.projectId) || null, [projects, task.projectId])
  const taskLabels = useMemo(() => labels.filter((l) => task.labelIds.includes(l.id)), [labels, task.labelIds])


  const priorityColor = priorityToColor(task.priority)
  const prioLabel = priorityToLabel(task.priority)
  const prioClass = priorityToClass(task.priority)

  const [dueClass, dueTitle] = useMemo(() => {
    if (!task.dueDate) return ['', '']
    const now = Date.now()
    let due: Date
    if (task.dueDate.includes('T')) {
      due = new Date(task.dueDate)
    } else {
      const [y, m, d] = task.dueDate.split('-').map((x) => Number(x))
      due = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999)
    }
    const diff = due.getTime() - now
    if (diff <= 0) return ['overdue', 'Overdue']
    if (diff <= 2 * 60 * 60 * 1000) return ['soon', 'Due in ≤2h']
    return ['normal', '']
  }, [task.dueDate])

  const overdueFlags = useMemo(() => {
    if (!task.dueDate) return { overdue: false }
    let due: Date
    if (task.dueDate.includes('T')) due = new Date(task.dueDate)
    else {
      const [y, m, d] = task.dueDate.split('-').map((x) => Number(x))
      due = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999)
    }
    return { overdue: Date.now() >= due.getTime() }
  }, [task.dueDate])

  const liClass = `task-item ${task.completed ? 'done' : ''} ${
    overdueFlags.overdue ? (task.completed ? 'overdue-blue' : 'overdue-red') : ''
  }`

  const [leaving, setLeaving] = useState(false)
  const onToggle = () => {
    setLeaving(true)
    setTimeout(() => toggleTask(task.id), 240)
  }

  const liCls = `${liClass} ${leaving ? 'leaving' : ''}`

  return (
    <li className={liCls}>
      <label className="checkbox">
        <input type="checkbox" checked={task.completed} onChange={onToggle} disabled={leaving} />
        <span className="checkmark" style={{ borderColor: priorityColor }} />
      </label>

      <div className="task-main">
        <div className="title-row" onClick={() => setShowTimer(true)} style={{cursor:'pointer'}}>
          <span className="title">{task.title}</span>
          <span className={`prio-chip ${prioClass}`}>{prioLabel}</span>
        </div>
        <div className="meta-row" onClick={() => setShowTimer(true)} style={{cursor:'pointer'}}>
          {task.dueDate && (
            <span className="due" title={dueTitle}>
              <span className="due-date">{formatDateOnly(task.dueDate)}</span>
              {formatTime(task.dueDate) && <>
                {' '}•{' '}
                <span className={`due-time ${dueClass}`}>{formatTime(task.dueDate)}</span>
              </>}
            </span>
          )}
          {task.completed && task.completedAt && (
            <span className="completed-chip" title={`Completed at ${task.completedAt}`}>
              <CheckCircleIcon className="completed-ico" />
              <span className="completed-date">{formatDateOnly(task.completedAt)}</span>
              {formatTime(task.completedAt) && <>
                {' '}•{' '}
                <span className="completed-time">{formatTime(task.completedAt)}</span>
              </>}
            </span>
          )}
          
          {project && (
            <span className="project-chip" style={{ backgroundColor: project.color + '33' }}>
              {project.name}
            </span>
          )}
          {taskLabels.map((l) => (
            <span key={l.id} className="label-chip">#{l.name}</span>
          ))}
        </div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" title="Edit" onClick={() => setEditing(true)}>
          ✎
        </button>
        <button className="icon-btn" title="Timer" onClick={() => setShowTimer(true)}>
          ⏱
        </button>
        <button className="icon-btn" title="Delete" onClick={async () => {
          const ok = await confirm({ title: 'Delete task?', message: `Delete "${task.title}"?` })
          if (ok) deleteTask(task.id)
        }}>
          🗑
        </button>
      </div>

      {editing && <AddTaskModal task={task} onClose={() => setEditing(false)} />}
      {showTimer && <TaskTimerModal task={task} onClose={() => setShowTimer(false)} />}
    </li>
  )
}

function priorityToColor(p: number): string {
  switch (p) {
    case 1:
      return '#FF5C5C' // Urgent
    case 2:
      return '#FF9F40' // High
    case 3:
      return '#FFD166' // Medium
    default:
      return '#6EE7B7' // Low
  }
}

function priorityToLabel(p: number): string {
  switch (p) {
    case 1:
      return 'Urgent'
    case 2:
      return 'High'
    case 3:
      return 'Medium'
    default:
      return 'Low'
  }
}

function priorityToClass(p: number): string {
  switch (p) {
    case 1:
      return 'prio-urgent'
    case 2:
      return 'prio-high'
    case 3:
      return 'prio-medium'
    default:
      return 'prio-low'
  }
}
