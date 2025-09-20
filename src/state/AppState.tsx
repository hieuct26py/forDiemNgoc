import { createContext, useContext, useMemo, useState } from 'react'
import { loadData, saveData, generateId, nowIso } from '../storage'
import type { Label, Project, Task } from '../types'

interface AppState {
  tasks: Task[]
  projects: Project[]
  labels: Label[]
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void
  updateTask: (t: Task) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  addTimeMinutes: (id: string, minutes: number) => void
  getActualMs: (t: Task) => number
  addProject: (name: string, color?: string) => string
  updateProject: (p: Project) => void
  deleteProject: (id: string) => void
  addLabel: (name: string) => string
  updateLabel: (l: Label) => void
  deleteLabel: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const init = useMemo(() => loadData(), [])
  const [tasks, setTasks] = useState<Task[]>(init.tasks)
  const [projects, setProjects] = useState<Project[]>(init.projects)
  const [labels, setLabels] = useState<Label[]>(init.labels)
  const [searchQuery, setSearchQuery] = useState('')

  const persist = (next: { tasks?: Task[]; projects?: Project[]; labels?: Label[] }) => {
    const data = {
      tasks: next.tasks ?? tasks,
      projects: next.projects ?? projects,
      labels: next.labels ?? labels,
    }
    saveData(data)
    if (next.tasks) setTasks(next.tasks)
    if (next.projects) setProjects(next.projects)
    if (next.labels) setLabels(next.labels)
  }

  const addTask: AppState['addTask'] = (t) => {
    const task: Task = {
      ...t,
      id: generateId('t'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completed: false,
      estimatedMinutes: t.estimatedMinutes ?? 30,
      accumulatedMs: 0,
      timerStartedAt: null,
      completedAt: null,
    }
    persist({ tasks: [task, ...tasks] })
  }

  const updateTask: AppState['updateTask'] = (t) => {
    persist({ tasks: tasks.map((x) => (x.id === t.id ? { ...t, updatedAt: nowIso() } : x)) })
  }

  const deleteTask: AppState['deleteTask'] = (id) => {
    persist({ tasks: tasks.filter((t) => t.id !== id) })
  }

  const toggleTask: AppState['toggleTask'] = (id) => {
    persist({
      tasks: tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? nowIso() : null,
              // stop timer if running
              accumulatedMs: t.timerStartedAt ? (t.accumulatedMs ?? 0) + (Date.now() - new Date(t.timerStartedAt).getTime()) : t.accumulatedMs ?? 0,
              timerStartedAt: null,
              updatedAt: nowIso(),
            }
          : t,
      ),
    })
  }

  const startTimer: AppState['startTimer'] = (id) => {
    persist({
      tasks: tasks.map((t) => (t.id === id && !t.timerStartedAt ? { ...t, timerStartedAt: nowIso(), updatedAt: nowIso() } : t)),
    })
  }

  const pauseTimer: AppState['pauseTimer'] = (id) => {
    const now = Date.now()
    persist({
      tasks: tasks.map((t) => {
        if (t.id !== id || !t.timerStartedAt) return t
        const acc = (t.accumulatedMs ?? 0) + (now - new Date(t.timerStartedAt).getTime())
        return { ...t, accumulatedMs: acc, timerStartedAt: null, updatedAt: nowIso() }
      }),
    })
  }

  const addTimeMinutes: AppState['addTimeMinutes'] = (id, minutes) => {
    persist({
      tasks: tasks.map((t) => (t.id === id ? { ...t, estimatedMinutes: (t.estimatedMinutes ?? 0) + minutes, updatedAt: nowIso() } : t)),
    })
  }

  const getActualMs: AppState['getActualMs'] = (t) => {
    const base = t.accumulatedMs ?? 0
    if (t.timerStartedAt) return base + (Date.now() - new Date(t.timerStartedAt).getTime())
    return base
  }

  const addProject: AppState['addProject'] = (name, color = randomColor()) => {
    const p: Project = { id: generateId('p'), name, color }
    persist({ projects: [...projects, p] })
    return p.id
  }

  const updateProject: AppState['updateProject'] = (p) => {
    persist({ projects: projects.map((x) => (x.id === p.id ? p : x)) })
  }

  const deleteProject: AppState['deleteProject'] = (id) => {
    persist({
      projects: projects.filter((p) => p.id !== id),
      tasks: tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
    })
  }

  const addLabel: AppState['addLabel'] = (name) => {
    const l: Label = { id: generateId('l'), name }
    persist({ labels: [...labels, l] })
    return l.id
  }

  const updateLabel: AppState['updateLabel'] = (l) => {
    persist({ labels: labels.map((x) => (x.id === l.id ? l : x)) })
  }

  const deleteLabel: AppState['deleteLabel'] = (id) => {
    persist({
      labels: labels.filter((l) => l.id !== id),
      tasks: tasks.map((t) => ({ ...t, labelIds: t.labelIds.filter((x) => x !== id) })),
    })
  }

  const value: AppState = {
    tasks,
    projects,
    labels,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    startTimer,
    pauseTimer,
    addTimeMinutes,
    getActualMs,
    addProject,
    updateProject,
    deleteProject,
    addLabel,
    updateLabel,
    deleteLabel,
    searchQuery,
    setSearchQuery,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function randomColor() {
  const colors = ['#FFB6C1', '#FFD27F', '#A3F7BF', '#5CC8FF', '#C6B7FF', '#FFA3A3']
  return colors[Math.floor(Math.random() * colors.length)]
}
