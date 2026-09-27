import { supabase } from '../lib/supabase'

export async function getProductReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
export async function submitReview(payload) {
  const { data, error } = await supabase.from('reviews').insert(payload).select().single()
  if (error) throw error
  return data
}
export async function listAdminReviews({ status } = {}) {
  let q = supabase.from('reviews').select('*, profiles(full_name), products(name)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data
}
export async function moderateReview(id, status) {
  const { data, error } = await supabase.from('reviews').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}
