import type { Label, Project, Task } from './types'

const STORAGE_KEY = 'nv_todoist_lite_v1'

export interface AppData {
  tasks: Task[]
  projects: Project[]
  labels: Label[]
}

export function generateId(prefix: string = 'id'): string {
  // Simple, collision-resistant enough for local usage
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const seed = seedData()
  saveData(seed)
  return seed
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData(): string {
  try {
    return JSON.stringify(loadData(), null, 2)
  } catch {
    return '{}'
  }
}

export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as AppData
    if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.labels)) {
      return false
    }
    saveData(parsed)
    return true
  } catch {
    return false
  }
}

function seedData(): AppData {
  const projects: Project[] = [
    { id: 'p_work', name: 'Work', color: '#FFB6C1' },
    { id: 'p_school', name: 'School', color: '#5CC8FF' },
    { id: 'p_homework', name: 'Homework', color: '#FFD27F' },
  ]
  const labels: Label[] = [
    { id: 'l_urgent', name: 'urgent' },
    { id: 'l_reading', name: 'reading' },
    { id: 'l_group', name: 'group' },
  ]

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

  const addDays = (d: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + d)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const da = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${da}`
  }

  const tasks: Task[] = [
    {
      id: generateId('t'),
      title: 'Plan study schedule',
      description: 'Outline weekly plan for coursework and part-time job',
      projectId: null,
      labelIds: ['l_urgent'],
      dueDate: todayStr,
      estimatedMinutes: 30,
      accumulatedMs: 0,
      timerStartedAt: null,
      completedAt: null,
      priority: 1,
      completed: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: generateId('t'),
      title: 'Finish algorithm assignment',
      description: 'Implement Dijkstra and write report',
      projectId: 'p_school',
      labelIds: ['l_group'],
      dueDate: addDays(2),
      estimatedMinutes: 120,
      accumulatedMs: 0,
      timerStartedAt: null,
      completedAt: null,
      priority: 2,
      completed: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: generateId('t'),
      title: 'Read research paper',
      description: 'Transformer architectures overview',
      projectId: 'p_work',
      labelIds: ['l_reading'],
      dueDate: addDays(5),
      estimatedMinutes: 45,
      accumulatedMs: 0,
      timerStartedAt: null,
      completedAt: null,
      priority: 3,
      completed: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ]

  return { tasks, projects, labels }
}
