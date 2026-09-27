import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { listAdminProducts, deleteProduct } from '../../api/products.api'
import { TableRowSkeleton } from '../../components/Skeleton'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../contexts/ToastContext'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AdminProducts() {
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const toast = useToast()

  function load() { listAdminProducts({ search }).then(setResult).catch(() => setResult({ data: [], count: 0 })) }
  useEffect(() => { setResult(null); load() }, [search])

  async function handleDelete() {
    try { await deleteProduct(toDelete.id); toast.success('Product deleted'); load() }
    catch { toast.error('Could not delete product') }
    finally { setToDelete(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary"><Plus size={16} /> Add Product</Link>
      </div>
      <input className="input max-w-sm mb-4" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="card bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3">Product</th><th className="p-3">Brand</th><th className="p-3">Condition</th>
              <th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result === null ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
            ) : result.data.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-neutral-500">No products found.</td></tr>
            ) : result.data.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.brands?.name}</td>
                <td className="p-3 capitalize">{p.condition.replace('_', ' ')}</td>
                <td className="p-3">{formatTHB(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 capitalize">{p.status.replace('_', ' ')}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/admin/products/${p.id}/edit`} className="btn-outline !p-2"><Pencil size={14} /></Link>
                    <button onClick={() => setToDelete(p)} className="btn-outline !p-2 !text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={`This will permanently remove "${toDelete?.name}".`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
