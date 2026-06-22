export const STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done']

export const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

export const TYPE_LABELS = {
  us: 'US',
  task: 'Task',
  bug: 'Bug',
  subtask: 'Subtask',
}

export const PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export const SP_OPTIONS = [1, 2, 3, 5, 8, 13, 21]

export function groupItemsByStatus(items) {
  const groups = Object.fromEntries(STATUSES.map(s => [s, []]))
  items
    .filter(i => !i.parent_id)
    .forEach(item => {
      if (groups[item.status]) groups[item.status].push(item)
    })
  return groups
}

export function groupEpicsByInitiative(epics) {
  const byInitiative = {}
  const noInitiative = []
  epics.forEach(epic => {
    if (epic.initiative_id) {
      if (!byInitiative[epic.initiative_id]) byInitiative[epic.initiative_id] = []
      byInitiative[epic.initiative_id].push(epic)
    } else {
      noInitiative.push(epic)
    }
  })
  return { byInitiative, noInitiative }
}

export function groupItemsByEpic(items) {
  const byEpic = {}
  const noEpic = []
  items
    .filter(i => !i.parent_id)
    .forEach(item => {
      if (item.epic_id) {
        if (!byEpic[item.epic_id]) byEpic[item.epic_id] = []
        byEpic[item.epic_id].push(item)
      } else {
        noEpic.push(item)
      }
    })
  return { byEpic, noEpic }
}
