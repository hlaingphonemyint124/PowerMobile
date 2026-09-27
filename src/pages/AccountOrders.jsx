import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyOrders } from '../api/orders.api'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AccountOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)

  useEffect(() => { if (user) getMyOrders(user.id).then(setOrders).catch(() => setOrders([])) }, [user])

  if (orders === null) return <PageLoader />
  if (orders.length === 0) return <EmptyState title="You haven't placed any orders yet." />

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link key={o.id} to={`/account/orders/${o.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="font-medium">{o.order_number}</p>
            <p className="text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString()} · {o.order_items.length} item(s)</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatTHB(o.total)}</p>
            <span className="text-xs capitalize text-neutral-500">{o.status}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
