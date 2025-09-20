import { createPortal } from 'react-dom'
import { useMemo, useState } from 'react'
import type { Task } from '../../types'
import { useApp } from '../../state/AppState'
import { formatDateOnly, formatTime } from '../../utils/date'
import { TaskTimerModal } from './TaskTimerModal'

export function TaskInfoModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const { projects, labels, toggleTask } = useApp()
  const [showTimer, setShowTimer] = useState(false)
  const project = useMemo(() => projects.find(p => p.id === task.projectId) || null, [projects, task.projectId])
  const taskLabels = useMemo(() => labels.filter(l => task.labelIds.includes(l.id)), [labels, task.labelIds])

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="modal-title">Task information</div>
        <div className="modal-body">
          <div>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>{task.title}</div>
            {task.description && <div style={{ color: 'var(--muted)' }}>{task.description}</div>}
          </div>

          <div className="meta-row">
            {task.dueDate && (
              <span className="due">
                <span className="due-date">{formatDateOnly(task.dueDate)}</span>
                {formatTime(task.dueDate) && <>
                  {' '}•{' '}
                  <span className={`due-time`}>{formatTime(task.dueDate)}</span>
                </>}
              </span>
            )}
            {project && (
              <span className="project-chip" style={{ backgroundColor: project.color + '33' }}>{project.name}</span>
            )}
            {taskLabels.map((l) => (
              <span key={l.id} className="label-chip">#{l.name}</span>
            ))}
          </div>

          <div className="form-row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => toggleTask(task.id)}>{task.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
            <button className="primary-btn" onClick={() => setShowTimer(true)}>Open Timer</button>
          </div>
        </div>
        {showTimer && <TaskTimerModal task={task} onClose={() => setShowTimer(false)} />}
      </div>
    </div>,
    document.body
  )
}

