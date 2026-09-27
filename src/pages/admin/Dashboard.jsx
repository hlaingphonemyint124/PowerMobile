import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getRecentOrders, getLowStockProducts } from '../../api/dashboard.api'
import PageLoader from '../../components/PageLoader'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => setStats({}))
    getRecentOrders().then(setOrders).catch(() => setOrders([]))
    getLowStockProducts().then(setLowStock).catch(() => setLowStock([]))
  }, [])

  if (!stats) return <PageLoader />

  const cards = [
    { label: 'Total Revenue', value: formatTHB(stats.totalRevenue || 0) },
    { label: 'Orders', value: stats.orderCount ?? 0 },
    { label: 'Products', value: stats.productCount ?? 0 },
    { label: 'Customers', value: stats.customerCount ?? 0 },
    { label: 'Trade-In Requests', value: stats.tradeinCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-4 bg-white dark:bg-neutral-900">
            <p className="text-xs text-neutral-500">{c.label}</p>
            <p className="text-xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-neutral-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-accent">View all</Link>
          </div>
          {orders.length === 0 ? <p className="text-sm text-neutral-500">No orders yet.</p> : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              {orders.map((o) => (
                <li key={o.id} className="py-2 flex justify-between">
                  <span>{o.order_number} — {o.profiles?.full_name || 'Guest'}</span>
                  <span>{formatTHB(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card bg-white dark:bg-neutral-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Low Stock Products</h2>
            <Link to="/admin/products" className="text-xs text-accent">View all</Link>
          </div>
          {lowStock.length === 0 ? <p className="text-sm text-neutral-500">Nothing low on stock.</p> : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-red-500">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
