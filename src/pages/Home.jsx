import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Repeat, ShieldCheck, Truck, BadgeCheck } from 'lucide-react'
import { listProducts } from '../api/products.api'
import { listBrands } from '../api/brands.api'
import { listPublishedNews } from '../api/news.api'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/Skeleton'

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [newArrivals, setNewArrivals] = useState(null)
  const [preOwned, setPreOwned] = useState(null)
  const [brands, setBrands] = useState([])
  const [news, setNews] = useState([])

  useEffect(() => {
    listProducts({ featured: true, page: 1 }).then((r) => setFeatured(r.data)).catch(() => setFeatured([]))
    listProducts({ newArrival: true, page: 1 }).then((r) => setNewArrivals(r.data)).catch(() => setNewArrivals([]))
    listProducts({ condition: 'pre_owned', page: 1 }).then((r) => setPreOwned(r.data)).catch(() => setPreOwned([]))
    listBrands().then(setBrands).catch(() => setBrands([]))
    listPublishedNews({ pageSize: 3 }).then((r) => setNews(r.data)).catch(() => setNews([]))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-950 text-white">
        <div className="container-page py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">Upgrade Your Phone.<br />Trade Smarter.</h1>
          <p className="mt-4 text-neutral-300 max-w-xl mx-auto">New, pre-owned and refurbished smartphones — inspected, graded, and backed by warranty. Trade in your old device for instant value.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/shop" className="btn-primary !bg-white !text-neutral-900 hover:!bg-neutral-200">Shop Phones</Link>
            <Link to="/trade-in" className="btn-outline !border-neutral-600 !text-white hover:!bg-neutral-800">Trade In Your Phone</Link>
          </div>
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="container-page py-10">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {brands.map((b) => (
              <Link key={b.id} to={`/brand/${b.slug}`} className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <Section title="New Arrivals" viewAllTo="/shop/new" products={newArrivals} />

      {/* Pre-Owned */}
      <Section title="Pre-Owned Phones" viewAllTo="/shop/pre-owned" products={preOwned} />

      {/* Featured / Deals */}
      <Section title="Featured Deals" viewAllTo="/deals" products={featured} />

      {/* Trade-in CTA */}
      <section className="container-page py-14">
        <div className="card bg-neutral-900 text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Got an old phone lying around?</h2>
            <p className="text-neutral-300 mt-1">Get an instant trade-in estimate and apply it toward your next upgrade.</p>
          </div>
          <Link to="/trade-in" className="btn-primary !bg-white !text-neutral-900 hover:!bg-neutral-200 shrink-0">Start Trade-In</Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-page py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose PhoneHub</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <Feature icon={ShieldCheck} title="Inspected & Graded" desc="Every pre-owned device is quality-checked." />
          <Feature icon={BadgeCheck} title="Warranty Included" desc="Peace of mind on every purchase." />
          <Feature icon={Repeat} title="Easy Trade-In" desc="Fair value, fast turnaround." />
          <Feature icon={Truck} title="Fast Delivery" desc="Quick, reliable shipping nationwide." />
        </div>
      </section>

      {/* News */}
      {news.length > 0 && (
        <section className="container-page py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Phone News</h2>
            <Link to="/news" className="text-sm font-medium text-accent">View all</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {news.map((n) => (
              <Link key={n.id} to={`/news/${n.slug}`} className="card overflow-hidden hover:shadow-lg transition-shadow">
                {n.thumbnail_url && <img src={n.thumbnail_url} alt={n.title} className="aspect-video w-full object-cover" />}
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{n.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{n.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container-page py-14">
        <div className="card p-8 text-center max-w-xl mx-auto">
          <h2 className="text-xl font-bold">Stay in the loop</h2>
          <p className="text-neutral-500 text-sm mt-1">Get notified about new arrivals, deals, and phone news.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
            <input type="email" required placeholder="you@example.com" className="input" />
            <button className="btn-primary shrink-0">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}

function Section({ title, viewAllTo, products }) {
  return (
    <section className="container-page py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={viewAllTo} className="text-sm font-medium text-accent">View all</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {products === null
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length === 0
            ? <p className="text-neutral-500 col-span-full text-center py-8">No products yet.</p>
            : products.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800"><Icon size={22} /></div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-neutral-500">{desc}</p>
    </div>
  )
}
