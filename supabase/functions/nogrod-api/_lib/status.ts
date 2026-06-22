export function buildStatusUpdate(
  currentItem: { started_at: string | null | undefined },
  newStatus: string,
): Record<string, unknown> {
  const update: Record<string, unknown> = { status: newStatus }

  if (newStatus === 'in_progress' && !currentItem.started_at) {
    update.started_at = new Date().toISOString()
  }

  if (newStatus === 'in_review') {
    update.completed_at = new Date().toISOString()
  }

  return update
}
