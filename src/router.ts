import type { View } from './types'

export function parseHash(hash: string = window.location.hash): View {
  const h = hash.replace(/^#/, '')
  const parts = h.split('/').filter(Boolean)
  if (parts.length === 0) return { type: 'home' }
  const [root, idOrQuery] = parts
  switch (root) {
    case 'home':
      return { type: 'home' }
    case 'all':
      return { type: 'all' }
    case 'overdue':
      return { type: 'overdue' }
    case 'today':
      return { type: 'today' }
    case 'upcoming':
      return { type: 'upcoming' }
    case 'calendar':
      return { type: 'calendar' as any }
    case 'analytics':
      return { type: 'analytics' as any }
    case 'completed':
      return { type: 'completed' }
    case 'project':
      if (idOrQuery) return { type: 'project', projectId: idOrQuery }
      return { type: 'home' }
    case 'label':
      if (idOrQuery) return { type: 'label', labelId: idOrQuery }
      return { type: 'home' }
    case 'search':
      return { type: 'search', query: decodeURIComponent(idOrQuery || '') }
    default:
      return { type: 'home' }
  }
}

export function setHash(view: View) {
  let h = '#/home'
  switch (view.type) {
    case 'home':
      h = '#/home'
      break
    case 'all':
      h = '#/all'
      break
    case 'overdue':
      h = '#/overdue'
      break
    case 'today':
      h = '#/today'
      break
    case 'upcoming':
      h = '#/upcoming'
      break
    case 'calendar':
      h = '#/calendar'
      break
    case 'analytics':
      h = '#/analytics'
      break
    case 'completed':
      h = '#/completed'
      break
    case 'project':
      h = `#/project/${view.projectId}`
      break
    case 'label':
      h = `#/label/${view.labelId}`
      break
    case 'search':
      h = `#/search/${encodeURIComponent(view.query)}`
      break
  }
  if (window.location.hash !== h) window.location.hash = h
}

import { useEffect, useState } from 'react'

export function useHashRoute(): [View, (v: View) => void] {
  const [view, setViewState] = useState<View>(() => parseHash())

  useEffect(() => {
    const onHash = () => setViewState(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setView = (v: View) => {
    setHash(v)
    setViewState(v)
  }

  return [view, setView]
}
