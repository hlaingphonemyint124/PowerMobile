import { supabase } from '../lib/supabase'

export async function listCategories() {
  const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
  if (error) throw error
  return data
}
export async function listAllCategoriesAdmin() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}
export async function createCategory(payload) {
  const { data, error } = await supabase.from('categories').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function updateCategory(id, payload) {
  const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
