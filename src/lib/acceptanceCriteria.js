import { supabase } from './supabase'

export async function loadCriteriaForItem(itemId) {
  const { data, error } = await supabase
    .from('acceptance_criteria')
    .select('*')
    .eq('item_id', itemId)
    .order('order_index')
    .order('created_at')
  if (error) throw error
  return data
}

export async function addCriterion(itemId, description) {
  const { data, error } = await supabase
    .from('acceptance_criteria')
    .insert({ item_id: itemId, description })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleCriterion(id, done) {
  const { error } = await supabase
    .from('acceptance_criteria')
    .update({ done })
    .eq('id', id)
  if (error) throw error
}

export async function deleteCriterion(id) {
  const { error } = await supabase
    .from('acceptance_criteria')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function bulkInsertCriteria(itemId, descriptions) {
  if (!descriptions || descriptions.length === 0) return
  const rows = descriptions.map((description, order_index) => ({
    item_id: itemId,
    description,
    order_index,
  }))
  const { error } = await supabase.from('acceptance_criteria').insert(rows)
  if (error) throw error
}
