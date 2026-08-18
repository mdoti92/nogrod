export const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

export function sortByPriority<T extends { priority?: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (PRIORITY_ORDER[b.priority ?? ''] ?? 0) - (PRIORITY_ORDER[a.priority ?? ''] ?? 0)
  )
}

export function isItemBlocked(
  itemId: string,
  depsByItemId: Record<string, string[]>,
  depStatusById: Record<string, string>
): boolean {
  const deps = depsByItemId[itemId] ?? []
  return deps.some(depId => depStatusById[depId] !== 'done')
}

export function selectNextItem<T extends { id: string; priority?: string }>(
  items: T[],
  depsByItemId: Record<string, string[]>,
  depStatusById: Record<string, string>
): T | null {
  const sorted = sortByPriority(items)
  return sorted.find(item => !isItemBlocked(item.id, depsByItemId, depStatusById)) ?? null
}

// deno-lint-ignore no-explicit-any
export async function getNextItem(supabase: any, projectId: string) {
  const { data: todoItems, error: itemsError } = await supabase
    .from('items')
    .select('*, acceptance_criteria(id, description, done, order_index)')
    .eq('project_id', projectId)
    .eq('status', 'todo')

  if (itemsError) throw itemsError
  if (!todoItems?.length) return null

  const todoIds = todoItems.map((i: any) => i.id)

  const { data: depsRows, error: depsError } = await supabase
    .from('dependencies')
    .select('item_id, depends_on_id')
    .in('item_id', todoIds)

  if (depsError) throw depsError

  const rows: Array<{ item_id: string; depends_on_id: string }> = depsRows ?? []
  const allDepsOnIds = [...new Set(rows.map(d => d.depends_on_id))]

  const depStatusById: Record<string, string> = {}
  const depItemById: Record<string, any> = {}

  if (allDepsOnIds.length > 0) {
    const { data: depItems, error: depItemsError } = await supabase
      .from('items')
      .select('id, status, item_id, title')
      .in('id', allDepsOnIds)

    if (depItemsError) throw depItemsError

    for (const di of depItems ?? []) {
      depStatusById[di.id] = di.status
      depItemById[di.id] = di
    }
  }

  const depsByItemId: Record<string, string[]> = {}
  for (const row of rows) {
    if (!depsByItemId[row.item_id]) depsByItemId[row.item_id] = []
    depsByItemId[row.item_id].push(row.depends_on_id)
  }

  const next = selectNextItem(todoItems, depsByItemId, depStatusById)
  if (!next) return null

  const resolvedDependencies = (depsByItemId[(next as any).id] ?? [])
    .map((depId: string) => depItemById[depId])
    .filter(Boolean)

  return { ...(next as object), resolved_dependencies: resolvedDependencies }
}
