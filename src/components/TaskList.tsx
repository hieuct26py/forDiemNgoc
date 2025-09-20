import type { Task } from '../types'
import { TaskItem } from './TaskItem'
import { useState } from 'react'
import { AddTaskModal } from './modals/AddTaskModal'

export function TaskList({ tasks, emptyText, showAddRow = true, initialDueDate }: { tasks: Task[]; emptyText?: string; showAddRow?: boolean; initialDueDate?: string }) {
  const PAGE = 50
  const [count, setCount] = useState(PAGE)
  const [adding, setAdding] = useState(false)
  const shown = tasks.slice(0, count)
  const hasMore = tasks.length > count
  return (
    <>
      {shown.length > 0 ? (
        <ul className="task-list">
          {shown.map((t) => (
            <TaskItem key={t.id} task={t} />
          ))}
        </ul>
      ) : (
        <div className="empty">{emptyText ?? 'No tasks here.'}</div>
      )}
      {showAddRow && (
        <div className="add-row">
          <div className="add-item" onClick={() => setAdding(true)}>
            <div style={{width:18,height:18, border:'2px solid rgba(2,8,23,0.25)', borderRadius:4, display:'flex',alignItems:'center',justifyContent:'center'}}>+</div>
            <div>Add a task</div>
          </div>
        </div>
      )}
      {hasMore && (
        <div className="empty">
          Showing {shown.length} of {tasks.length}.{' '}
          <button className="btn" onClick={() => setCount((c) => c + PAGE)}>Load more</button>
        </div>
      )}
      {adding && <AddTaskModal onClose={() => setAdding(false)} initialDueDate={initialDueDate} />}
    </>
  )
}
