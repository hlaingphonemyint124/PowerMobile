import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createNews, updateNews, listAdminNews } from '../../api/news.api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminNewsForm() {
  const { id } = useParams()
  const isEdit = !!id
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', thumbnail_url: '', tags: '', status: 'draft' })
  const [saving, setSaving] = useState(false)
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isEdit) {
      // fetch by id via admin list (simplest reuse without a dedicated getById)
      listAdminNews().then((all) => {
        const found = all.find((n) => n.id === id)
        if (found) setForm({ ...found, tags: (found.tags || []).join(', ') })
      })
    }
  }, [id, isEdit])

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('news-images').upload(path, file)
    if (error) { toast.error('Upload failed'); return }
    const { data } = supabase.storage.from('news-images').getPublicUrl(path)
    set('thumbnail_url', data.publicUrl)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        thumbnail_url: form.thumbnail_url,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: form.status,
        author_id: profile?.id,
        published_at: form.status === 'published' ? (form.published_at || new Date().toISOString()) : null,
      }
      if (isEdit) await updateNews(id, payload)
      else await createNews(payload)
      toast.success('Article saved')
      navigate('/admin/news')
    } catch (err) {
      toast.error(err.message || 'Could not save article')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Article' : 'New Article'}</h1>
      <form onSubmit={handleSubmit} className="card bg-white dark:bg-neutral-900 p-6 space-y-4 max-w-2xl">
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required /></div>
        <div><label className="label">Slug (auto if blank)</label><input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} /></div>
        <div><label className="label">Excerpt</label><textarea className="input" rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} /></div>
        <div><label className="label">Content</label><textarea className="input" rows={10} value={form.content} onChange={(e) => set('content', e.target.value)} /></div>
        <div>
          <label className="label">Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
          {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="h-24 mt-2 rounded-lg" />}
        </div>
        <div><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={(e) => set('tags', e.target.value)} /></div>
        <div>
          <label className="label">Status</label>
          <select className="input max-w-xs" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Article'}</button>
      </form>
    </div>
  )
}
