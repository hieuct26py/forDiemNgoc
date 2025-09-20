import { useMemo } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'

export function ProjectView({ projectId }: { projectId: string }) {
  const { tasks, projects } = useApp()
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId])
  const list = useMemo(() => tasks.filter((t) => t.projectId === projectId && !t.completed).sort(sortTasks), [tasks, projectId])

  return (
    <section>
      <h2>{project?.name ?? 'Project'}</h2>
      <TaskList tasks={list} emptyText="No tasks for this project." />
    </section>
  )
}

function sortTasks(a: any, b: any) {
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (at !== bt) return at - bt
  return a.priority - b.priority
}
