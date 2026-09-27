import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../api/orders.api'
import PageLoader from '../components/PageLoader'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AccountOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)

  useEffect(() => { getOrderById(id).then(setOrder).catch(() => setOrder(null)) }, [id])

  if (order === undefined) return <PageLoader />
  if (order === null) return <p>Order not found.</p>

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{order.order_number}</h2>
        <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{order.status}</span>
      </div>
      <div className="space-y-2 mb-4">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product_name} × {item.quantity}</span>
            <span>{formatTHB(item.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-neutral-500">Subtotal</span><span>{formatTHB(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatTHB(order.discount)}</span></div>}
        <div className="flex justify-between"><span className="text-neutral-500">Shipping</span><span>{formatTHB(order.shipping_fee)}</span></div>
        <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatTHB(order.total)}</span></div>
      </div>
      {order.shipping_address && (
        <div className="mt-4 text-sm text-neutral-500">
          <p className="font-medium text-neutral-700 dark:text-neutral-300">Shipping to</p>
          <p>{order.shipping_address.fullName}, {order.shipping_address.line1}, {order.shipping_address.city} {order.shipping_address.postalCode}</p>
          <p>{order.shipping_address.phone}</p>
        </div>
      )}
    </div>
  )
}
