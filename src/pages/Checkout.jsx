import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { placeOrder, validateCoupon } from '../api/orders.api'

function formatTHB(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(n)
}

const SHIPPING_FEE = 100

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [address, setAddress] = useState({ fullName: '', phone: '', line1: '', city: '', postalCode: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) {
    return <div className="container-page py-16 text-center"><p>Your cart is empty.</p></div>
  }
  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <p className="mb-4">Please sign in to check out.</p>
        <button onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })} className="btn-primary">Sign In</button>
      </div>
    )
  }

  async function handleApplyCoupon() {
    if (!couponCode) return
    try {
      const result = await validateCoupon(couponCode.trim().toUpperCase(), subtotal)
      if (result?.valid) { setDiscount(Number(result.discount)); toast.success('Coupon applied') }
      else { setDiscount(0); toast.error(result?.message || 'Invalid coupon') }
    } catch {
      toast.error('Could not validate coupon')
    }
  }

  const total = subtotal - discount + SHIPPING_FEE

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!address.fullName || !address.phone || !address.line1 || !address.city) {
      toast.error('Please fill in all shipping fields')
      return
    }
    setPlacing(true)
    try {
      const orderId = await placeOrder({
        userId: user.id,
        items,
        shippingAddress: address,
        paymentMethod,
        couponCode: discount > 0 ? couponCode.trim().toUpperCase() : null,
        shippingFee: SHIPPING_FEE,
      })
      clearCart()
      toast.success('Order placed successfully')
      navigate(`/account/orders/${orderId}`)
    } catch (err) {
      toast.error(err.message || 'Could not place order')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">Full Name</label><input className="input" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} required /></div>
              <div><label className="label">Phone</label><input className="input" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required /></div>
              <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} required /></div>
              <div><label className="label">City</label><input className="input" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required /></div>
              <div><label className="label">Postal Code</label><input className="input" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'promptpay', label: 'PromptPay' },
              ].map((m) => (
                <label key={m.value} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                  {m.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-1 text-sm mb-4 max-h-40 overflow-y-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between"><span className="truncate pr-2">{i.name} × {i.quantity}</span><span>{formatTHB(i.price * i.quantity)}</span></div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <button type="button" onClick={handleApplyCoupon} className="btn-outline shrink-0">Apply</button>
          </div>
          <div className="flex justify-between text-sm mb-1"><span className="text-neutral-500">Subtotal</span><span>{formatTHB(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm mb-1 text-green-600"><span>Discount</span><span>-{formatTHB(discount)}</span></div>}
          <div className="flex justify-between text-sm mb-3"><span className="text-neutral-500">Shipping</span><span>{formatTHB(SHIPPING_FEE)}</span></div>
          <div className="flex justify-between font-semibold text-lg border-t border-neutral-200 dark:border-neutral-800 pt-3 mb-4"><span>Total</span><span>{formatTHB(total)}</span></div>
          <button className="btn-primary w-full" disabled={placing}>{placing ? 'Placing Order...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  )
}
