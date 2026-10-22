export const PAUSED_STATUS = 'paused'

export const PAUSABLE_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review']

export function isPaused(entity) {
  return entity.status === PAUSED_STATUS
}

export function canPause(entity) {
  return PAUSABLE_STATUSES.includes(entity.status)
}

export function buildPauseUpdate(entity) {
  if (!canPause(entity)) {
    throw new Error(`No se puede pausar desde el estado "${entity.status}"`)
  }
  return { status: PAUSED_STATUS, paused_from_status: entity.status }
}

export function buildResumeUpdate(entity) {
  if (!isPaused(entity)) {
    throw new Error('Solo se puede reanudar algo que está pausado')
  }
  if (!PAUSABLE_STATUSES.includes(entity.paused_from_status)) {
    throw new Error(`Estado previo inválido: "${entity.paused_from_status}"`)
  }
  return { status: entity.paused_from_status, paused_from_status: null }
}

export function filterVisibleItems(items, { showPaused = false } = {}) {
  if (showPaused) return items
  return items.filter(item => !isPaused(item))
}

// A paused epic stays visible while it holds visible items: hiding it would also
// hide active work, which would be a cascade effect the product explicitly rejects.
export function filterVisibleEpics(epics, visibleItemsByEpic, { showPaused = false } = {}) {
  if (showPaused) return epics
  return epics.filter(epic => !isPaused(epic) || (visibleItemsByEpic[epic.id]?.length ?? 0) > 0)
}
