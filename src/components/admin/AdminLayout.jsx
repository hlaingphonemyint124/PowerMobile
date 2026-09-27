import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Repeat, HandCoins,
  Newspaper, Tags, Layers, Percent, Ticket, Star, Bell, Settings, Menu, LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/trade-ins', label: 'Trade-Ins', icon: Repeat },
  { to: '/admin/sell-requests', label: 'Sell Requests', icon: HandCoins },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/brands', label: 'Brands', icon: Tags },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/promotions', label: 'Promotions', icon: Percent },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login')
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 font-bold text-lg border-b border-neutral-800">PhoneHub Admin</div>
      <nav className="flex-1 overflow-y-auto py-2">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm ${isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800/60'}`
            }
          >
            <l.icon size={17} /> {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-neutral-800 text-sm">
        <p className="text-neutral-400 truncate">{profile?.email}</p>
        <button onClick={handleLogout} className="mt-2 flex items-center gap-2 text-neutral-300 hover:text-white">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-neutral-950">
      <aside className="hidden lg:block w-64 bg-neutral-900 text-white shrink-0">{SidebarContent}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-neutral-900 text-white h-full">{SidebarContent}</div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="font-semibold">Admin</span>
          <span className="w-6" />
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
