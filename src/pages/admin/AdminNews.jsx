import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { listAdminNews, deleteNews, updateNews } from '../../api/news.api'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import PageLoader from '../../components/PageLoader'

export default function AdminNews() {
  const [news, setNews] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const toast = useToast()

  function load() { listAdminNews().then(setNews).catch(() => setNews([])) }
  useEffect(load, [])

  async function handlePublishToggle(n) {
    const status = n.status === 'published' ? 'draft' : 'published'
    try {
      await updateNews(n.id, { status, published_at: status === 'published' ? new Date().toISOString() : n.published_at })
      load()
      toast.success(status === 'published' ? 'Article published' : 'Article unpublished')
    } catch { toast.error('Could not update article') }
  }

  async function handleDelete() {
    try { await deleteNews(toDelete.id); toast.success('Article deleted'); load() }
    catch { toast.error('Could not delete article') }
    finally { setToDelete(null) }
  }

  if (news === null) return <PageLoader />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">News</h1>
        <Link to="/admin/news/new" className="btn-primary"><Plus size={16} /> New Article</Link>
      </div>
      <div className="card bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
            <tr><th className="p-3">Title</th><th className="p-3">Status</th><th className="p-3">Created</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {news.length === 0 ? <tr><td colSpan={4} className="text-center p-8 text-neutral-500">No articles yet.</td></tr> :
              news.map((n) => (
                <tr key={n.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 font-medium">{n.title}</td>
                  <td className="p-3 capitalize">{n.status}</td>
                  <td className="p-3">{new Date(n.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handlePublishToggle(n)} className="btn-outline !text-xs !py-1">{n.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                      <Link to={`/admin/news/${n.id}/edit`} className="btn-outline !p-2"><Pencil size={14} /></Link>
                      <button onClick={() => setToDelete(n)} className="btn-outline !p-2 !text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={!!toDelete} title="Delete article?" message={`Remove "${toDelete?.title}" permanently.`} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
    </div>
  )
}
