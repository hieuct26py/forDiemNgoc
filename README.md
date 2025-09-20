[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)

# To‑Do App — Preliminary Assignment Submission

Please check `ASSIGNMENT.md` in this repository for assignment requirements.

## Project Setup & Usage
How to install and run locally:
- Requirements: Node.js 18+
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Open the printed local URL

Build & preview:
- `npm run build`
- `npm run preview`

## Deployed Web URL
[Will be added later]

## Demo Video
[Will be added later]

## Project Introduction

### a. Overview
Todue is a Todoist‑inspired, student‑friendly task manager. It is pure‑frontend (React + Vite + TypeScript), offline‑first (localStorage), and focuses on clarity and productivity: create tasks, organize with sections/labels, plan with Today/Upcoming/Calendar, track time vs. estimates, and review weekly analytics and score.

### b. Key Features & Function Manual
- Task management (CRUD)
  - Add, edit, complete, delete tasks
  - Due date (defaults to 23:59 if time omitted) and priority (Urgent, High, Medium, Low)
  - Labels: add/rename/delete; Sections (formerly Projects): add/rename/delete
- Views
  - Home: profile (avatar + name), motivational slogan, quick stats
  - All Tasks: grouped into Overdue, Today, Upcoming (by day), No Due Date; per‑group sorting (By Time or By Priority)
  - Today: tasks due today (sorting: time/priority)
  - Upcoming: grouped by day (sorting: time/priority within each day)
  - Completed: list of completed tasks (no “Add task” row)
  - Calendar (default Week): toggle Week/Month; click a day to open a compact Day view (all tasks of that day) with a button to add a task
- Quick add and inline actions
  - Global “+ Quick Add” modal: section, labels, due date/time, priority, estimated minutes
  - Inline “Add a task” row at bottom of lists (hidden in Completed)
- Timer & time tracking
  - Task Timer modal: Start/Pause, +5m/+10m/+30m; circular countdown ring
  - Tracks Estimated vs Actual (accumulated time); uses 24‑hour time across the app
- Notifications & urgency
  - Red banner “Start now or you’ll be late” detects risk of being late based on your past estimation bias
  - Click a banner chip to open Task Info modal (title, description, due, section, labels, quick Complete, open Timer)
- Analytics
  - Overview: Completed, Missed, Avg Estimation Bias, On‑time Rate
  - Weekly Performance: 7‑day stacked bars (on‑time/late/overdue)
  - Weekly Score (water bottle): fill equals score% with tier labels (Excellent / Very Good / Good / Keep Going) and week range
- Sidebar & navigation
  - Sections (default: Work, School, Homework) + Labels
  - Inline add, inline rename (pencil), and delete with confirmation
  - Active highlighting with smooth slide; hover/active visuals aligned
  - Weather chips (Hà Nội, Đắk Lắk) and 24‑hour clock under brand
- Search & filters
  - Header search filters tasks; integrated search in All Tasks
- Responsive design
  - Desktop: fixed sidebar; gradient background fills 100% height (no white gaps)
  - Mobile/tablet: sidebar becomes slide‑in; calendar compacts; day modal uses 92vw

### c. Unique Features (What’s special?)
- Offline‑first, instant use (no login/backend)
- “Water‑bottle” weekly score visualization (fill = score%) that motivates
- Smart urgency banner that learns your time bias
- Friendly UX touches: profile hero, motivational slogan, color cues for due time and priority
- Rich calendar interactions: day popover with list + quick add; click chip to open Timer

### d. Technology Stack and Implementation Methods
- React + Vite + TypeScript
- CSS‑only styling (no UI framework)
- Hash‑based routing (custom)
- React Context (AppState) + localStorage persistence
- Lightweight date utilities (24h formatting, grouping)
- Optional import/export JSON backup

### e. Service Architecture & Data
- Architecture: pure frontend SPA
- Persistence: `localStorage` under key `nv_todoist_lite_v1`
- Data model
  - Task: `{ id, title, description?, projectId, labelIds[], dueDate?, priority, estimatedMinutes?, accumulatedMs?, timerStartedAt?, completedAt?, completed, createdAt, updatedAt }`
  - Section: `{ id, name, color }`
  - Label: `{ id, name }`

## Reflection

### a. If you had more time, what would you expand?
- Recurring tasks & reminders; ICS export; calendar day/time slots
- Drag‑and‑drop ordering; kanban per section; templates for checklists
- Deeper analytics: streaks, heatmaps, focus hours, trends over months

### b. If you integrate AI APIs more for your app, what would you do?
- Natural‑language task input (e.g., “Math HW tomorrow 20:00 @School #urgent 45m”)
- Smart prioritization and scheduling suggestions
- Estimation assistant learned from past behavior
- Focus coach: short guidance based on workload and deadlines

## Checklist
- [x] Code runs without errors
- [x] All required features implemented (add/edit/delete/complete tasks)
- [x] All required sections filled (deployment/demo links will be added later)

