import { useEffect, useState } from 'react'
import { listAllCategoriesAdmin, createCategory, updateCategory, deleteCategory } from '../../api/categories.api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Trash2 } from 'lucide-react'

function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const toast = useToast()

  function load() { listAllCategoriesAdmin().then(setCategories).catch(() => setCategories([])) }
  useEffect(load, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    try { await createCategory({ name, slug: slugify(name) }); setName(''); load(); toast.success('Category added') }
    catch { toast.error('Could not add category') }
  }

  async function handleToggle(c) { await updateCategory(c.id, { is_active: !c.is_active }); load() }

  async function handleDelete() {
    try { await deleteCategory(toDelete.id); load(); toast.success('Category deleted') }
    catch { toast.error('Could not delete — it may be used by existing products') }
    finally { setToDelete(null) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6 max-w-md">
        <input className="input" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary shrink-0">Add</button>
      </form>
      <div className="card bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3">
            <span>{c.name}</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={c.is_active} onChange={() => handleToggle(c)} /> Active</label>
              <button onClick={() => setToDelete(c)} className="text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog open={!!toDelete} title="Delete category?" onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  )
}
