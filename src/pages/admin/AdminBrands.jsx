import { useEffect, useState } from 'react'
import { listAllBrandsAdmin, createBrand, updateBrand, deleteBrand } from '../../api/brands.api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Trash2 } from 'lucide-react'

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [name, setName] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const toast = useToast()

  function load() { listAllBrandsAdmin().then(setBrands).catch(() => setBrands([])) }
  useEffect(load, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    try { await createBrand({ name, slug: slugify(name) }); setName(''); load(); toast.success('Brand added') }
    catch { toast.error('Could not add brand') }
  }

  async function handleToggle(b) {
    await updateBrand(b.id, { is_active: !b.is_active }); load()
  }

  async function handleDelete() {
    try { await deleteBrand(toDelete.id); load(); toast.success('Brand deleted') }
    catch { toast.error('Could not delete — it may be used by existing products') }
    finally { setToDelete(null) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Brands</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input className="input" placeholder="New brand name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary shrink-0">Add</button>
      </form>
      <div className="card bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between p-3">
            <span>{b.name}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={b.is_active} onChange={() => handleToggle(b)} /> Active</label>
              <button onClick={() => setToDelete(b)} className="text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!toDelete} title="Delete brand?" onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  )
}
