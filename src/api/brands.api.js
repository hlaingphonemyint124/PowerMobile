import { supabase } from '../lib/supabase'

export async function listBrands() {
  const { data, error } = await supabase.from('brands').select('*').eq('is_active', true).order('name')
  if (error) throw error
  return data
}
export async function listAllBrandsAdmin() {
  const { data, error } = await supabase.from('brands').select('*').order('name')
  if (error) throw error
  return data
}
export async function createBrand(payload) {
  const { data, error } = await supabase.from('brands').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function updateBrand(id, payload) {
  const { data, error } = await supabase.from('brands').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id)
  if (error) throw error
}
