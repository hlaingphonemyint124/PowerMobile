import { supabase } from '../lib/supabase'

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase.from('profiles').update(fields).eq('id', userId).select().single()
  if (error) throw error
  return data
}
export async function listAdminCustomers({ search } = {}) {
  let q = supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
  if (search) q = q.ilike('email', `%${search}%`)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function toggleCustomerDisabled(id, isDisabled) {
  const { data, error } = await supabase.from('profiles').update({ is_disabled: isDisabled }).eq('id', id).select().single()
  if (error) throw error
  return data
}
