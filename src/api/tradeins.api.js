import { supabase } from '../lib/supabase'

export async function submitTradeIn(payload) {
  const { data, error } = await supabase.from('trade_in_requests').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function getMyTradeIns(userId) {
  const { data, error } = await supabase.from('trade_in_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function listAdminTradeIns({ status } = {}) {
  let q = supabase.from('trade_in_requests').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function updateTradeIn(id, fields) {
  const { data, error } = await supabase.from('trade_in_requests').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function uploadTradeInPhoto(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('trade-in-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('trade-in-images').getPublicUrl(path)
  return data.publicUrl
}
