import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LINKS = [
  { to: '/account', label: 'Overview', end: true },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/wishlist', label: 'Wishlist' },
  { to: '/account/trade-ins', label: 'Trade-Ins' },
  { to: '/account/sell-requests', label: 'Sell Requests' },
  { to: '/account/profile', label: 'Profile' },
]

export default function Account() {
  const { profile } = useAuth()
  const location = useLocation()
  const isOverview = location.pathname === '/account'

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${location.pathname === l.to ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          {isOverview ? (
            <div className="card p-6">
              <p className="text-sm text-neutral-500">Signed in as</p>
              <p className="font-semibold">{profile?.full_name || profile?.email}</p>
              <p className="text-sm text-neutral-500 mt-4">Use the menu to manage your orders, wishlist, trade-ins, sell requests and profile.</p>
            </div>
          ) : <Outlet />}
        </div>
      </div>
    </div>
  )
}
