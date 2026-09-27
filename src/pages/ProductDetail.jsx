import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Zap, ShieldCheck } from 'lucide-react'
import { getProductBySlug } from '../api/products.api'
import { getProductReviews, submitReview } from '../api/reviews.api'
import { addToWishlist } from '../api/wishlist.api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import PageLoader from '../components/PageLoader'

function formatTHB(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)
}

export default function ProductDetail() {
  const { id: slug } = useParams()
  const [product, setProduct] = useState(undefined)
  const [activeImage, setActiveImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const { addItem } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setProduct(undefined)
    getProductBySlug(slug).then(setProduct).catch(() => setProduct(null))
  }, [slug])

  useEffect(() => {
    if (product) getProductReviews(product.id).then(setReviews).catch(() => setReviews([]))
  }, [product])

  if (product === undefined) return <PageLoader />
  if (product === null) return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/shop" className="btn-primary mt-4 inline-flex">Back to Shop</Link>
    </div>
  )

  const images = (product.product_images || []).slice().sort((a, b) => a.display_order - b.display_order)
  const image = images[activeImage]?.image_url
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : null

  function handleAddToCart() {
    addItem({ id: product.id, name: product.name, price: product.price, image: images[0]?.image_url, stock: product.stock }, 1)
    toast.success('Added to cart')
  }

  function handleBuyNow() {
    handleAddToCart()
    navigate('/checkout')
  }

  async function handleWishlist() {
    if (!user) { toast.info('Sign in to save items to your wishlist'); return }
    try { await addToWishlist(user.id, product.id); toast.success('Added to wishlist') }
    catch { toast.error('Could not add to wishlist') }
  }

  return (
    <div className="container-page py-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {image ? <img src={image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-400">No image</div>}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)} className={`h-16 w-16 rounded-lg overflow-hidden border-2 shrink-0 ${activeImage === i ? 'border-accent' : 'border-transparent'}`}>
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.condition !== 'new' && <p className="text-xs text-neutral-500 mt-3">Actual device photos shown above.</p>}
        </div>

        <div>
          <p className="text-sm text-neutral-500">{product.brands?.name}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            {product.condition !== 'new' && (
              <span className="bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded">
                {product.condition === 'pre_owned' ? 'PRE-OWNED' : 'REFURBISHED'}
              </span>
            )}
            {product.condition_grade && <span className="border border-neutral-300 dark:border-neutral-700 text-xs font-medium px-2 py-1 rounded">Grade {product.condition_grade}</span>}
            {product.warranty && <span className="flex items-center gap-1 text-xs text-neutral-500"><ShieldCheck size={14} /> {product.warranty}</span>}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatTHB(product.price)}</span>
            {discount && <>
              <span className="line-through text-neutral-400">{formatTHB(product.original_price)}</span>
              <span className="text-green-600 font-semibold">-{discount}%</span>
            </>}
          </div>

          <dl className="grid grid-cols-2 gap-3 mt-6 text-sm">
            {product.storage && <Spec label="Storage" value={product.storage} />}
            {product.ram && <Spec label="RAM" value={product.ram} />}
            {product.color && <Spec label="Color" value={product.color} />}
            {product.battery_health && <Spec label="Battery Health" value={`${product.battery_health}%`} />}
            <Spec label="Availability" value={product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} />
          </dl>

          <div className="flex gap-3 mt-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-outline flex-1"><ShoppingCart size={16} /> Add to Cart</button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-primary flex-1"><Zap size={16} /> Buy Now</button>
            <button onClick={handleWishlist} className="btn-outline !px-3" aria-label="Wishlist"><Heart size={16} /></button>
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Specifications</h2>
              <dl className="text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5">
                    <dt className="text-neutral-500">{k}</dt><dd>{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} reviews={reviews} user={user} toast={toast} />
    </div>
  )
}

function Spec({ label, value }) {
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-2.5">
      <dt className="text-neutral-500 text-xs">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function ReviewsSection({ productId, reviews, user, toast }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { toast.info('Sign in to leave a review'); return }
    setSubmitting(true)
    try {
      await submitReview({ product_id: productId, user_id: user.id, rating, comment, status: 'pending' })
      toast.success('Review submitted for moderation')
      setComment('')
    } catch {
      toast.error('Could not submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Reviews {avg && <span className="text-neutral-500 text-base font-normal">({avg} avg, {reviews.length} reviews)</span>}</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No reviews yet — be the first to review this product.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span>{r.profiles?.full_name || 'Verified Customer'}</span>
                {r.verified_purchase && <span className="text-xs text-green-600">Verified Purchase</span>}
              </div>
              {r.title && <p className="font-medium mt-1">{r.title}</p>}
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="label">Leave a review</label>
        <select className="input !w-auto" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
        </select>
        <textarea className="input" rows={3} placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required />
        <button className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
      </form>
    </section>
  )
}
