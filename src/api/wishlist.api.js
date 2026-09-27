import { supabase } from '../lib/supabase'

async function ensureWishlist(userId) {
  const { data: existing } = await supabase.from('wishlists').select('id').eq('user_id', userId).maybeSingle()
  if (existing) return existing.id
  const { data, error } = await supabase.from('wishlists').insert({ user_id: userId }).select('id').single()
  if (error) throw error
  return data.id
}

export async function getWishlist(userId) {
  const wishlistId = await ensureWishlist(userId)
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('id, product_id, products(id, name, slug, price, original_price, condition, product_images(image_url, display_order))')
    .eq('wishlist_id', wishlistId)
  if (error) throw error
  return data
}

export async function addToWishlist(userId, productId) {
  const wishlistId = await ensureWishlist(userId)
  const { error } = await supabase.from('wishlist_items').insert({ wishlist_id: wishlistId, product_id: productId })
  if (error && error.code !== '23505') throw error
}

export async function removeFromWishlist(userId, productId) {
  const wishlistId = await ensureWishlist(userId)
  const { error } = await supabase.from('wishlist_items').delete().eq('wishlist_id', wishlistId).eq('product_id', productId)
  if (error) throw error
}
