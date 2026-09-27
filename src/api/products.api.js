import { supabase } from '../lib/supabase'

const PAGE_SIZE = 12

// filters: { brand, category, condition, minPrice, maxPrice, storage, search, sort, page }
export async function listProducts(filters = {}) {
  let q = supabase
    .from('products')
    .select('*, brands(name, slug), categories(name, slug), product_images(image_url, display_order)', { count: 'exact' })
    .eq('status', 'active')

  if (filters.brand) q = q.eq('brands.slug', filters.brand)
  if (filters.category) q = q.eq('categories.slug', filters.category)
  if (filters.condition) q = q.eq('condition', filters.condition)
  if (filters.storage) q = q.eq('storage', filters.storage)
  if (filters.minPrice) q = q.gte('price', filters.minPrice)
  if (filters.maxPrice) q = q.lte('price', filters.maxPrice)
  if (filters.search) q = q.ilike('name', `%${filters.search}%`)
  if (filters.featured) q = q.eq('is_featured', true)
  if (filters.newArrival) q = q.eq('is_new_arrival', true)
  if (filters.bestSeller) q = q.eq('is_best_seller', true)

  switch (filters.sort) {
    case 'price_asc': q = q.order('price', { ascending: true }); break
    case 'price_desc': q = q.order('price', { ascending: false }); break
    case 'newest': q = q.order('created_at', { ascending: false }); break
    default: q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
  }

  const page = filters.page || 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  q = q.range(from, to)

  const { data, error, count } = await q
  if (error) throw error
  return { data, count, pageSize: PAGE_SIZE }
}

// Note: imei/serial_number are deliberately left out of this SELECT so they
// never reach the browser on the public product page, even though RLS would
// technically allow an admin session to read them. Use getAdminProductUnits
// (admin-only) when those fields are actually needed.
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(name, slug), categories(name, slug), product_images(*), product_units(id, unit_code, battery_health, condition_grade, condition_notes, price, status)')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function getAdminProductUnits(productId) {
  const { data, error } = await supabase
    .from('product_units')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProductUnit(payload) {
  const { data, error } = await supabase.from('product_units').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProductUnit(id, payload) {
  const { data, error } = await supabase.from('product_units').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*, brands(name, slug)').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function listAdminProducts({ search, page = 1, pageSize = 20 } = {}) {
  let q = supabase.from('products').select('*, brands(name)', { count: 'exact' }).order('created_at', { ascending: false })
  if (search) q = q.ilike('name', `%${search}%`)
  const from = (page - 1) * pageSize
  q = q.range(from, from + pageSize - 1)
  const { data, error, count } = await q
  if (error) throw error
  return { data, count }
}

export async function addProductImage({ productId, imageUrl, imageType = 'gallery', displayOrder = 0 }) {
  const { data, error } = await supabase.from('product_images')
    .insert({ product_id: productId, image_url: imageUrl, image_type: imageType, display_order: displayOrder })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteProductImage(id) {
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) throw error
}

export async function uploadProductImageFile(file, productId) {
  const ext = file.name.split('.').pop()
  const path = `${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
