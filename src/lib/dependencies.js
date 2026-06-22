import { supabase } from './supabase'

export async function loadDependenciesForItem(itemId) {
  const { data, error } = await supabase
    .from('dependencies')
    .select('depends_on_id')
    .eq('item_id', itemId)
  if (error) throw error
  return (data || []).map(row => row.depends_on_id)
}

export async function addDependency(itemId, dependsOnId) {
  const { error } = await supabase
    .from('dependencies')
    .insert({ item_id: itemId, depends_on_id: dependsOnId })
  if (error) throw error
}

export async function deleteDependency(itemId, dependsOnId) {
  const { error } = await supabase
    .from('dependencies')
    .delete()
    .eq('item_id', itemId)
    .eq('depends_on_id', dependsOnId)
  if (error) throw error
}

export async function bulkInsertDependencies(itemId, dependsOnIds) {
  if (!dependsOnIds || dependsOnIds.length === 0) return
  const rows = dependsOnIds.map(depends_on_id => ({ item_id: itemId, depends_on_id }))
  const { error } = await supabase.from('dependencies').insert(rows)
  if (error) throw error
}
