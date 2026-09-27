import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'phonehub_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  function addItem(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      const maxQty = product.stock ?? 99
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxQty)
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: newQty } : i))
      }
      return [...prev, {
        id: product.id, name: product.name, price: product.price,
        image: product.image, stock: product.stock, quantity: Math.min(quantity, maxQty),
      }]
    })
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function updateQuantity(id, quantity) {
    setItems((prev) => prev.map((i) => {
      if (i.id !== id) return i
      const clamped = Math.max(1, Math.min(quantity, i.stock ?? 99))
      return { ...i, quantity: clamped }
    }))
  }

  function clearCart() { setItems([]) }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
