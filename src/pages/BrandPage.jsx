import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listProducts } from '../api/products.api'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

export default function BrandPage() {
  const { brand } = useParams()
  const [products, setProducts] = useState(null)
  useEffect(() => { setProducts(null); listProducts({ brand }).then((r) => setProducts(r.data)).catch(() => setProducts([])) }, [brand])

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">{brand} Phones</h1>
      {products === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found for this brand." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
