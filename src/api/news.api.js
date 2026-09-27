import { supabase } from '../lib/supabase'

export async function listPublishedNews({ page = 1, pageSize = 9 } = {}) {
  const from = (page - 1) * pageSize
  const { data, error, count } = await supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)
  if (error) throw error
  return { data, count }
}
export async function getNewsBySlug(slug) {
  const { data, error } = await supabase.from('news').select('*').eq('slug', slug).single()
  if (error) throw error
  return data
}
export async function listAdminNews() {
  const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function createNews(payload) {
  const { data, error } = await supabase.from('news').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function updateNews(id, payload) {
  const { data, error } = await supabase.from('news').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteNews(id) {
  const { error } = await supabase.from('news').delete().eq('id', id)
  if (error) throw error
}
