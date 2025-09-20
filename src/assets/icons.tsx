import React from 'react'

type P = React.SVGProps<SVGSVGElement>

export const HomeIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M3 11l9-8 9 8"/>
    <path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/>
  </svg>
)

export const CalendarIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

export const ListIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M8 6h13M8 12h13M8 18h13"/>
    <path d="M3 6h.01M3 12h.01M3 18h.01"/>
  </svg>
)

export const SunIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  </svg>
)

export const ArrowUpRightIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M7 17L17 7"/>
    <path d="M7 7h10v10"/>
  </svg>
)

export const CheckCircleIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
)

export const ActivityIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M22 12h-4l-3 7-6-14-3 7H2"/>
  </svg>
)

export const PlusIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export const PencilIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
)

export const InstagramIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <path d="M17.5 6.5h.01" />
  </svg>
)

export const CameraIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h3l2-3h6l2 3h3a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

export const CloudIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M17.5 19a4.5 4.5 0 100-9 6 6 0 10-11.4 2"/>
    <path d="M3 19h14.5"/>
  </svg>
)

export const CloudRainIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M17.5 18a4.5 4.5 0 100-9 6 6 0 10-11.4 2"/>
    <path d="M16 22l-2-3M8 22l-2-3M12 22l-2-3"/>
  </svg>
)

export const SnowIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M12 2v20M4 6l16 12M4 18L20 6"/>
  </svg>
)

export const StormIcon = (props: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <path d="M17 18a4 4 0 100-8 6 6 0 10-11.5 2"/>
    <path d="M13 22l2-4h-3l2-4"/>
  </svg>
)
