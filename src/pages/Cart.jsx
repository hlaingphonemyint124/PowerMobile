import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import EmptyState from '../components/EmptyState'
import { ShoppingCart } from 'lucide-react'

function formatTHB(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)
}

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={ShoppingCart} title="Your cart is empty." description="Browse the shop to find your next phone." action={<Link to="/shop" className="btn-primary">Shop Phones</Link>} />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              <div className="h-20 w-20 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-neutral-500">{formatTHB(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn-outline !p-1.5"><Minus size={14} /></button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn-outline !p-1.5" disabled={item.quantity >= (item.stock ?? 99)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatTHB(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-red-500 text-xs mt-2 flex items-center gap-1"><Trash2 size={13} /> Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-neutral-500">Subtotal</span><span>{formatTHB(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-neutral-500">Shipping</span><span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t border-neutral-200 dark:border-neutral-800 pt-3">
            <span>Total</span><span>{formatTHB(subtotal)}</span>
          </div>
          <Link to="/checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  )
}
