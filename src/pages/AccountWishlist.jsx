import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getWishlist, removeFromWishlist } from '../api/wishlist.api'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'
import { Heart, Trash2 } from 'lucide-react'

function formatTHB(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n) }

export default function AccountWishlist() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()
  const [items, setItems] = useState(null)

  function load() { if (user) getWishlist(user.id).then(setItems).catch(() => setItems([])) }
  useEffect(load, [user])

  if (items === null) return <PageLoader />
  if (items.length === 0) return <EmptyState icon={Heart} title="Your wishlist is empty." action={<Link to="/shop" className="btn-primary">Shop Phones</Link>} />

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((i) => {
        const p = i.products
        const image = (p.product_images || []).slice().sort((a, b) => a.display_order - b.display_order)[0]?.image_url
        return (
          <div key={i.id} className="card p-4 flex gap-3">
            <div className="h-16 w-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
              {image && <img src={image} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${p.slug}`} className="font-medium text-sm line-clamp-1">{p.name}</Link>
              <p className="text-sm text-neutral-500">{formatTHB(p.price)}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { addItem({ id: p.id, name: p.name, price: p.price, image }); toast.success('Added to cart') }} className="btn-primary !text-xs !py-1">Add to Cart</button>
                <button onClick={async () => { await removeFromWishlist(user.id, p.id); load() }} className="btn-outline !text-xs !py-1"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
