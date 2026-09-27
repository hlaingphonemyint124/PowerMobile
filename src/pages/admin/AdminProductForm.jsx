import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProduct, updateProduct, getProductById,
  uploadProductImageFile, addProductImage, deleteProductImage,
} from '../../api/products.api'
import { listAllBrandsAdmin } from '../../api/brands.api'
import { listAllCategoriesAdmin } from '../../api/categories.api'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'
import { Trash2 } from 'lucide-react'

const EMPTY = {
  name: '', slug: '', model: '', sku: '', brand_id: '', category_id: '',
  condition: 'new', condition_grade: '', storage: '', ram: '', color: '',
  battery_health: '', price: '', original_price: '', stock: 0,
  description: '', warranty: '', status: 'active',
  is_featured: false, is_new_arrival: false, is_best_seller: false,
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEdit = !!id
  const [form, setForm] = useState(EMPTY)
  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    listAllBrandsAdmin().then(setBrands).catch(() => setBrands([]))
    listAllCategoriesAdmin().then(setCategories).catch(() => setCategories([]))
    if (isEdit) {
      getProductById(id).then((p) => setForm({ ...EMPTY, ...p })).catch(() => toast.error('Product not found'))
      supabase.from('product_images').select('*').eq('product_id', id).order('display_order')
        .then(({ data }) => setImages(data || []))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock: Number(form.stock),
        battery_health: form.battery_health ? Number(form.battery_health) : null,
        condition_grade: form.condition_grade || null,
        brand_id: form.brand_id || null,
        category_id: form.category_id || null,
      }
      delete payload.id; delete payload.created_at; delete payload.updated_at
      delete payload.brands; delete payload.categories; delete payload.product_images; delete payload.product_units

      if (isEdit) {
        await updateProduct(id, payload)
        toast.success('Product updated')
      } else {
        const created = await createProduct(payload)
        toast.success('Product created')
        navigate(`/admin/products/${created.id}/edit`)
        return
      }
    } catch (err) {
      toast.error(err.message || 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    if (!isEdit) { toast.info('Save the product first before uploading images'); return }
    const files = Array.from(e.target.files || [])
    setUploading(true)
    try {
      for (const file of files) {
        const url = await uploadProductImageFile(file, id)
        const img = await addProductImage({ productId: id, imageUrl: url, displayOrder: images.length })
        setImages((prev) => [...prev, img])
      }
      toast.success('Images uploaded')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteImage(imgId) {
    await deleteProductImage(imgId)
    setImages((prev) => prev.filter((i) => i.id !== imgId))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={handleSubmit} className="card bg-white dark:bg-neutral-900 p-6 space-y-6 max-w-3xl">
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
          <div><label className="label">Slug (auto if blank)</label><input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} /></div>
          <div><label className="label">SKU</label><input className="input" value={form.sku || ''} onChange={(e) => set('sku', e.target.value)} /></div>
          <div><label className="label">Model</label><input className="input" value={form.model || ''} onChange={(e) => set('model', e.target.value)} /></div>
          <div>
            <label className="label">Brand</label>
            <select className="input" value={form.brand_id || ''} onChange={(e) => set('brand_id', e.target.value)}>
              <option value="">Select brand</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category_id || ''} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Condition</label>
            <select className="input" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="new">New</option><option value="pre_owned">Pre-Owned</option><option value="refurbished">Refurbished</option>
            </select>
          </div>
          {form.condition !== 'new' && (
            <>
              <div>
                <label className="label">Condition Grade</label>
                <select className="input" value={form.condition_grade || ''} onChange={(e) => set('condition_grade', e.target.value)}>
                  <option value="">—</option><option>A+</option><option>A</option><option>B</option><option>C</option>
                </select>
              </div>
              <div><label className="label">Battery Health (%)</label><input type="number" className="input" value={form.battery_health || ''} onChange={(e) => set('battery_health', e.target.value)} /></div>
            </>
          )}
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Storage</label><input className="input" value={form.storage || ''} onChange={(e) => set('storage', e.target.value)} /></div>
          <div><label className="label">RAM</label><input className="input" value={form.ram || ''} onChange={(e) => set('ram', e.target.value)} /></div>
          <div><label className="label">Color</label><input className="input" value={form.color || ''} onChange={(e) => set('color', e.target.value)} /></div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Price (฿)</label><input type="number" className="input" value={form.price} onChange={(e) => set('price', e.target.value)} required /></div>
          <div><label className="label">Original Price (฿)</label><input type="number" className="input" value={form.original_price || ''} onChange={(e) => set('original_price', e.target.value)} /></div>
          <div><label className="label">Stock</label><input type="number" className="input" value={form.stock} onChange={(e) => set('stock', e.target.value)} required /></div>
        </section>

        <div><label className="label">Warranty</label><input className="input" value={form.warranty || ''} onChange={(e) => set('warranty', e.target.value)} placeholder="e.g. 1 Year Warranty" /></div>
        <div><label className="label">Description</label><textarea className="input" rows={4} value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></div>

        <section className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_new_arrival} onChange={(e) => set('is_new_arrival', e.target.checked)} /> New Arrival</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => set('is_best_seller', e.target.checked)} /> Best Seller</label>
        </section>

        <div>
          <label className="label">Status</label>
          <select className="input max-w-xs" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option><option value="out_of_stock">Out of Stock</option>
            <option value="reserved">Reserved</option><option value="sold">Sold</option><option value="archived">Archived</option>
          </select>
        </div>

        {isEdit && (
          <section>
            <label className="label">Product Images</label>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}</button>
      </form>
    </div>
  )
}
