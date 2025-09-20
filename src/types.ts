export type Priority = 1 | 2 | 3 | 4

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string | null // null = Inbox
  labelIds: string[]
  // YYYY-MM-DD or YYYY-MM-DDTHH:mm (local)
  dueDate?: string
  estimatedMinutes?: number
  accumulatedMs?: number
  timerStartedAt?: string | null
  completedAt?: string | null
  priority: Priority
  completed: boolean
  createdAt: string // ISO
  updatedAt: string // ISO
}

export interface Project {
  id: string
  name: string
  color: string // hex
}

export interface Label {
  id: string
  name: string
}

export type View =
  | { type: 'home' }
  | { type: 'all' }
  | { type: 'overdue' }
  | { type: 'today' }
  | { type: 'upcoming' }
  | { type: 'completed' }
  | { type: 'calendar' }
  | { type: 'analytics' }
  | { type: 'project'; projectId: string }
  | { type: 'label'; labelId: string }
  | { type: 'search'; query: string }
