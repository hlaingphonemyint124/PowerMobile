import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, Smartphone } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../hooks/useTheme'

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop/new', label: 'New Phones' },
  { to: '/shop/pre-owned', label: 'Pre-Owned' },
  { to: '/trade-in', label: 'Trade-In' },
  { to: '/deals', label: 'Deals' },
  { to: '/news', label: 'News' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { user } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
    setMobileOpen(false)
  }

  return (
    <header className={`sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="container-page h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Smartphone size={22} /> PhoneHub
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-accent transition-colors">{l.label}</Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phones, brands, models..."
              className="input !pl-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link to="/account/wishlist" className="hidden sm:block p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg" aria-label="Wishlist">
            <Heart size={19} />
          </Link>
          <Link to="/cart" className="relative p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg" aria-label="Cart">
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <Link to={user ? '/account' : '/login'} className="hidden sm:block p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg" aria-label="Account">
            <User size={19} />
          </Link>
          <button className="lg:hidden p-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 px-4 py-4 space-y-4 bg-white dark:bg-neutral-950">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="input !pl-9" />
          </form>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="py-2 border-b border-neutral-100 dark:border-neutral-800">{l.label}</Link>
            ))}
            <Link to="/account" onClick={() => setMobileOpen(false)} className="py-2">My Account</Link>
            <Link to="/account/wishlist" onClick={() => setMobileOpen(false)} className="py-2">Wishlist</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
