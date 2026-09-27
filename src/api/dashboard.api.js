import { supabase } from '../lib/supabase'

export async function getDashboardStats() {
  const [{ count: productCount }, { count: orderCount }, { count: customerCount }, { count: tradeinCount }, revenueRes] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('trade_in_requests').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('payment_status', 'paid'),
  ])
  const totalRevenue = (revenueRes.data || []).reduce((sum, o) => sum + Number(o.total || 0), 0)
  return { productCount, orderCount, customerCount, tradeinCount, totalRevenue }
}

export async function getRecentOrders(limit = 5) {
  const { data, error } = await supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}

export async function getLowStockProducts(threshold = 5, limit = 5) {
  const { data, error } = await supabase.from('products').select('id, name, stock').lte('stock', threshold).order('stock').limit(limit)
  if (error) throw error
  return data
}
