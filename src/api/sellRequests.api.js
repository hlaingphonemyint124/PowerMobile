import { supabase } from '../lib/supabase'

export async function submitSellRequest(payload) {
  const { data, error } = await supabase.from('sell_requests').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function getMySellRequests(userId) {
  const { data, error } = await supabase.from('sell_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function listAdminSellRequests({ status } = {}) {
  let q = supabase.from('sell_requests').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function updateSellRequest(id, fields) {
  const { data, error } = await supabase.from('sell_requests').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
