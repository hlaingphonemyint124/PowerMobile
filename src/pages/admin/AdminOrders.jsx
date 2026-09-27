import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listAdminOrders } from '../../api/orders.api'
import { TableRowSkeleton } from '../../components/Skeleton'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AdminOrders() {
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('')

  useEffect(() => { setResult(null); listAdminOrders({ status: status || undefined }).then(setResult).catch(() => setResult({ data: [] })) }, [status])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <select className="input max-w-xs mb-4" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="card bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
            <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
          </thead>
          <tbody>
            {result === null ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />) :
              result.data.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-neutral-500">No orders found.</td></tr> :
              result.data.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-3"><Link to={`/admin/orders/${o.id}`} className="font-medium text-accent">{o.order_number}</Link></td>
                  <td className="p-3">{o.profiles?.full_name || '—'}</td>
                  <td className="p-3">{formatTHB(o.total)}</td>
                  <td className="p-3 capitalize">{o.payment_status}</td>
                  <td className="p-3 capitalize">{o.status}</td>
                  <td className="p-3">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
