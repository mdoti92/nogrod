export const VALID_STATUSES = ['backlog', 'todo', 'in_progress', 'in_review', 'done'] as const

export function isValidStatus(status: unknown): status is string {
  return typeof status === 'string' && (VALID_STATUSES as readonly string[]).includes(status)
}
