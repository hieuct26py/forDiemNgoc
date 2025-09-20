import { useMemo } from 'react'
import { useApp } from '../state/AppState'
import { TaskList } from '../components/TaskList'

export function LabelView({ labelId }: { labelId: string }) {
  const { tasks, labels } = useApp()
  const label = useMemo(() => labels.find((l) => l.id === labelId), [labels, labelId])
  const list = useMemo(
    () => tasks.filter((t) => t.labelIds.includes(labelId) && !t.completed).sort(sortTasks),
    [tasks, labelId],
  )

  return (
    <section>
      <h2>#{label?.name ?? 'Label'}</h2>
      <TaskList tasks={list} emptyText="No tasks with this label." />
    </section>
  )
}

function sortTasks(a: any, b: any) {
  const at = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
  if (at !== bt) return at - bt
  return a.priority - b.priority
}
