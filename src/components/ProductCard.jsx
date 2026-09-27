import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { addToWishlist } from '../api/wishlist.api'

function formatTHB(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)
}

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()

  const image = (product.product_images || [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order)[0]?.image_url
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id: product.id, name: product.name, price: product.price, image, stock: product.stock }, 1)
    toast.success('Added to cart')
  }

  async function handleWishlist(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.info('Sign in to save items to your wishlist'); return }
    try {
      await addToWishlist(user.id, product.id)
      toast.success('Added to wishlist')
    } catch {
      toast.error('Could not add to wishlist')
    }
  }

  return (
    <Link to={`/product/${product.slug}`} className="card overflow-hidden group hover:shadow-lg transition-shadow relative">
      <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">No image</div>
        )}
        {product.condition !== 'new' && (
          <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[11px] font-medium px-2 py-1 rounded">
            {product.condition === 'pre_owned' ? 'PRE-OWNED' : 'REFURBISHED'}
          </span>
        )}
        {product.condition_grade && (
          <span className="absolute top-2 right-2 bg-white/90 dark:bg-neutral-900/90 text-[11px] font-medium px-2 py-1 rounded border border-neutral-200 dark:border-neutral-700">
            Grade {product.condition_grade}
          </span>
        )}
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="absolute bottom-2 right-2 bg-white/90 dark:bg-neutral-900/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart size={16} />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-neutral-500">{product.brands?.name}</p>
        <h3 className="font-medium text-sm mt-0.5 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
          {product.storage && <span>{product.storage}</span>}
          {product.battery_health && <span>· {product.battery_health}% battery</span>}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-semibold">{formatTHB(product.price)}</span>
            {discount && (
              <div className="flex items-center gap-1 text-xs">
                <span className="line-through text-neutral-400">{formatTHB(product.original_price)}</span>
                <span className="text-green-600 font-medium">-{discount}%</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            className="btn-primary !p-2 !rounded-full disabled:opacity-40"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        {product.stock === 0 && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
      </div>
    </Link>
  )
}
