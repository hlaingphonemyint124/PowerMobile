import { supabase } from '../lib/supabase'

// Places an order through the server-side RPC so price/stock/coupon logic
// is enforced in the database, never trusted from the browser.
export async function placeOrder({ userId, items, shippingAddress, paymentMethod, couponCode, shippingFee }) {
  const { data, error } = await supabase.rpc('create_order', {
    p_user_id: userId,
    p_items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    p_shipping_address: shippingAddress,
    p_payment_method: paymentMethod,
    p_coupon_code: couponCode || null,
    p_shipping_fee: shippingFee || 0,
  })
  if (error) throw error
  return data // order id
}

export async function validateCoupon(code, subtotal) {
  const { data, error } = await supabase.rpc('validate_coupon', { p_code: code, p_subtotal: subtotal })
  if (error) throw error
  return data?.[0]
}

export async function getMyOrders(userId) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single()
  if (error) throw error
  return data
}

export async function listAdminOrders({ status, page = 1, pageSize = 20 } = {}) {
  let q = supabase.from('orders').select('*, profiles(full_name, email)', { count: 'exact' }).order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const from = (page - 1) * pageSize
  q = q.range(from, from + pageSize - 1)
  const { data, error, count } = await q
  if (error) throw error
  return { data, count }
}

export async function updateOrderStatus(id, fields) {
  const { data, error } = await supabase.from('orders').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}
