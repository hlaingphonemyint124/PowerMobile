import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { listProducts } from '../api/products.api'
import { listBrands } from '../api/brands.api'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'pre_owned', label: 'Pre-Owned' },
  { value: 'refurbished', label: 'Refurbished' },
]

export default function Shop() {
  const { category } = useParams() // e.g. /shop/new or /shop/pre-owned (route-level convenience)
  const [searchParams, setSearchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [brands, setBrands] = useState([])

  const filters = {
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    condition: category === 'new' ? 'new' : category === 'pre-owned' ? 'pre_owned' : (searchParams.get('condition') || ''),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'featured',
    page: Number(searchParams.get('page') || 1),
  }

  useEffect(() => {
    listBrands().then(setBrands).catch(() => setBrands([]))
  }, [])

  useEffect(() => {
    setResult(null)
    listProducts(filters).then(setResult).catch(() => setResult({ data: [], count: 0, pageSize: 12 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, category])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  function goToPage(p) {
    const next = new URLSearchParams(searchParams)
    next.set('page', p)
    setSearchParams(next)
  }

  const totalPages = result ? Math.ceil(result.count / result.pageSize) : 1
  const title = category === 'new' ? 'New Phones' : category === 'pre-owned' ? 'Pre-Owned Phones' : 'Shop All Phones'

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-6">
          <div>
            <label className="label">Brand</label>
            <select className="input" value={filters.brand} onChange={(e) => updateFilter('brand', e.target.value)}>
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
            </select>
          </div>
          {!category && (
            <div>
              <label className="label">Condition</label>
              <select className="input" value={filters.condition} onChange={(e) => updateFilter('condition', e.target.value)}>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Price Range (฿)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="input" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
              <input type="number" placeholder="Max" className="input" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500">{result ? `${result.count} products` : 'Loading...'}</p>
            <select className="input !w-auto" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {result === null ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : result.data.length === 0 ? (
            <EmptyState title="No products found." description="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {result.data.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`h-9 w-9 rounded-lg text-sm ${filters.page === i + 1 ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-300 dark:border-neutral-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
