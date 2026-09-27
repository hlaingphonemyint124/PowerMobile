import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNewsBySlug } from '../api/news.api'
import PageLoader from '../components/PageLoader'

export default function NewsDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState(undefined)
  useEffect(() => { getNewsBySlug(slug).then(setArticle).catch(() => setArticle(null)) }, [slug])

  if (article === undefined) return <PageLoader />
  if (article === null) return (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Article not found</h1>
      <Link to="/news" className="btn-primary mt-4 inline-flex">Back to News</Link>
    </div>
  )

  return (
    <article className="container-page py-8 max-w-2xl">
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p className="text-sm text-neutral-500 mt-2">{new Date(article.published_at).toLocaleDateString()}</p>
      {article.thumbnail_url && <img src={article.thumbnail_url} alt={article.title} className="w-full rounded-xl mt-6" />}
      <div className="prose dark:prose-invert max-w-none mt-6 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
        {article.content}
      </div>
    </article>
  )
}
