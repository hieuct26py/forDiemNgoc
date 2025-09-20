import { useMemo } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'

export function CompletedView() {
  const { tasks } = useApp()
  const list = useMemo(() => {
    return tasks
      .filter((t) => t.completed)
      .sort((a, b) => {
        const at = a.completedAt ? new Date(a.completedAt).getTime() : 0
        const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0
        return bt - at
      })
  }, [tasks])

  return (
    <section>
      <h2>Completed</h2>
      <TaskList tasks={list} emptyText="No completed tasks." showAddRow={false} />
    </section>
  )
}
