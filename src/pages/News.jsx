import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPublishedNews } from '../api/news.api'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'

export default function News() {
  const [news, setNews] = useState(null)
  useEffect(() => { listPublishedNews({ pageSize: 12 }).then((r) => setNews(r.data)).catch(() => setNews([])) }, [])

  if (news === null) return <PageLoader />
  if (news.length === 0) return <div className="container-page py-16"><EmptyState title="No news articles yet." /></div>

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">Phone News</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((n) => (
          <Link key={n.id} to={`/news/${n.slug}`} className="card overflow-hidden hover:shadow-lg transition-shadow">
            {n.thumbnail_url && <img src={n.thumbnail_url} alt={n.title} className="aspect-video w-full object-cover" />}
            <div className="p-4">
              <h2 className="font-semibold line-clamp-2">{n.title}</h2>
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{n.excerpt}</p>
              <p className="text-xs text-neutral-400 mt-2">{new Date(n.published_at).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
