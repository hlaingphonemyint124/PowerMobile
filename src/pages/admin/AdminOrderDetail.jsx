import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById, updateOrderStatus } from '../../api/orders.api'
import { useToast } from '../../contexts/ToastContext'
import PageLoader from '../../components/PageLoader'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)
  const [notes, setNotes] = useState('')
  const toast = useToast()

  function load() { getOrderById(id).then((o) => { setOrder(o); setNotes(o.notes || '') }).catch(() => setOrder(null)) }
  useEffect(load, [id])

  async function handleUpdate(fields) {
    try { const updated = await updateOrderStatus(id, fields); setOrder({ ...order, ...updated }); toast.success('Order updated') }
    catch { toast.error('Could not update order') }
  }

  if (order === undefined) return <PageLoader />
  if (order === null) return <p>Order not found.</p>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{order.order_number}</h1>

      <div className="card bg-white dark:bg-neutral-900 p-5">
        <h2 className="font-semibold mb-3">Items</h2>
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>{item.product_name} × {item.quantity}</span><span>{formatTHB(item.subtotal)}</span>
          </div>
        ))}
        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-3 pt-3 font-semibold flex justify-between">
          <span>Total</span><span>{formatTHB(order.total)}</span>
        </div>
      </div>

      <div className="card bg-white dark:bg-neutral-900 p-5 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Order Status</label>
          <select className="input" value={order.status} onChange={(e) => handleUpdate({ status: e.target.value })}>
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Payment Status</label>
          <select className="input" value={order.payment_status} onChange={(e) => handleUpdate({ payment_status: e.target.value })}>
            {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card bg-white dark:bg-neutral-900 p-5">
        <label className="label">Admin Notes</label>
        <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => handleUpdate({ notes })} />
      </div>

      {order.shipping_address && (
        <div className="card bg-white dark:bg-neutral-900 p-5 text-sm">
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <p>{order.shipping_address.fullName}, {order.shipping_address.line1}, {order.shipping_address.city} {order.shipping_address.postalCode}</p>
          <p>{order.shipping_address.phone}</p>
        </div>
      )}
    </div>
  )
}
