import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../state/AppState'
import { useConfirm } from '../../ui/Confirm'
import type { Task } from '../../types'
import { toInputDate } from '../../utils/date'

type Props = {
  task?: Task
  onClose: () => void
  initialDueDate?: string
}

export function AddTaskModal({ task, onClose, initialDueDate }: Props) {
  const { addTask, updateTask, projects, labels } = useApp()
  const confirm = useConfirm()
  const [title, setTitle] = useState(task?.title ?? '')
  const [desc, setDesc] = useState(task?.description ?? '')
  const [projectId, setProjectId] = useState<string | null>(task?.projectId ?? null)
  const initD = task?.dueDate ? task.dueDate : initialDueDate
  const [dueDate, setDueDate] = useState<string | undefined>(initD ? initD.slice(0, 10) : undefined)
  const [dueTime, setDueTime] = useState<string | undefined>(initD && initD.includes('T') ? initD.slice(11, 16) : undefined)
  const [priority, setPriority] = useState<number>(task?.priority ?? 3)
  const [labelIds, setLabelIds] = useState<string[]>(task?.labelIds ?? [])
  const [estimated, setEstimated] = useState<number>(task?.estimatedMinutes ?? 30)

  const canSave = title.trim().length > 0

  // Track initial values to warn on accidental close
  const initialRef = useRef<{
    title: string
    desc: string
    projectId: string | null
    dueDate: string
    dueTime: string
    priority: number
    labelIds: string // sorted joined
    estimated: number
  } | null>(null)
  if (!initialRef.current) {
    initialRef.current = {
      title,
      desc,
      projectId,
      dueDate: dueDate ?? '',
      dueTime: dueTime ?? '',
      priority,
      labelIds: JSON.stringify([...labelIds].sort()),
      estimated,
    }
  }

  const attemptClose = async () => {
    const init = initialRef.current!
    const dirty =
      title !== init.title ||
      desc !== init.desc ||
      (projectId ?? '') !== (init.projectId ?? '') ||
      (dueDate ?? '') !== init.dueDate ||
      (dueTime ?? '') !== init.dueTime ||
      priority !== init.priority ||
      estimated !== init.estimated ||
      JSON.stringify([...labelIds].sort()) !== init.labelIds
    if (dirty) {
      const ok = await confirm({
        title: 'Discard changes?',
        message: 'Bạn đang nhập dở. Bỏ các thay đổi và đóng?',
        confirmText: 'Discard',
        cancelText: 'Keep editing',
      })
      if (!ok) return
    }
    onClose()
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    const finalDue = dueDate ? `${dueDate}T${(dueTime && dueTime.length) ? dueTime : '23:59'}` : undefined
    if (task) {
      updateTask({
        ...task,
        title: title.trim(),
        description: desc.trim() || undefined,
        projectId,
        dueDate: finalDue,
        priority: priority as 1 | 2 | 3 | 4,
        labelIds,
        estimatedMinutes: estimated,
      })
    } else {
      addTask({
        title: title.trim(),
        description: desc.trim() || undefined,
        projectId,
        dueDate: finalDue,
        priority: priority as 1 | 2 | 3 | 4,
        labelIds,
        estimatedMinutes: estimated,
      })
    }
    onClose()
  }

  const todayStr = useMemo(() => toInputDate(new Date()), [])

  return createPortal(
    <div className="modal-backdrop" onClick={attemptClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{task ? 'Edit task' : 'Add task'}</div>
        <form className="modal-body" onSubmit={onSubmit}>
          <input
            autoFocus
            className="text-input big"
            placeholder="Task name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="text-input"
            placeholder="Description (optional)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="form-row">
            <label>
              Estimated time (minutes)
              <input
                className="select"
                type="number"
                min={1}
                step={1}
                value={estimated}
                onChange={(e) => setEstimated(Math.max(1, Number(e.target.value || 0)))}
              />
            </label>
            <label>
              Project
              <select className="select" value={projectId ?? ''} onChange={(e) => setProjectId(e.target.value || null)}>
                <option value="">Inbox</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Due date
              <input
                className="select"
                type="date"
                value={dueDate ?? ''}
                onChange={(e) => setDueDate(e.target.value || undefined)}
                min={todayStr}
              />
            </label>

            <label>
              Time (optional)
              <input
                className="select"
                type="time"
                value={dueTime ?? ''}
                onChange={(e) => setDueTime(e.target.value || undefined)}
              />
            </label>

            <label>
              Priority
              <select className="select" value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
                <option value={1}>Urgent (Highest)</option>
                <option value={2}>High</option>
                <option value={3}>Medium</option>
                <option value={4}>Low</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <fieldset className="labels-field">
              <legend>Labels</legend>
              <div className="labels-list">
                {labels.map((l) => {
                  const checked = labelIds.includes(l.id)
                  return (
                    <label key={l.id} className={`label-pill ${checked ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) setLabelIds([...labelIds, l.id])
                          else setLabelIds(labelIds.filter((x) => x !== l.id))
                        }}
                      />
                      #{l.name}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={attemptClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={!canSave}>
              {task ? 'Save' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
