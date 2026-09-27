import { useEffect, useState } from 'react'
import { listAdminSellRequests, updateSellRequest } from '../../api/sellRequests.api'
import { useToast } from '../../contexts/ToastContext'
import PageLoader from '../../components/PageLoader'

const STATUSES = ['submitted', 'reviewing', 'offer_sent', 'accepted', 'rejected', 'completed', 'cancelled']

export default function AdminSellRequests() {
  const [items, setItems] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const toast = useToast()

  function load() { listAdminSellRequests().then(setItems).catch(() => setItems([])) }
  useEffect(load, [])

  async function handleUpdate(id, fields) {
    try {
      const updated = await updateSellRequest(id, fields)
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
      toast.success('Sell request updated')
    } catch { toast.error('Could not update') }
  }

  if (items === null) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sell Requests</h1>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-neutral-500">No sell requests.</p>}
        {items.map((t) => (
          <div key={t.id} className="card bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div>
                <p className="font-medium">{t.brand} {t.model} — {t.contact_name}</p>
                <p className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleDateString()} · {t.contact_phone}</p>
              </div>
              <span className="text-xs capitalize px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{t.status.replace('_', ' ')}</span>
            </div>
            {expanded === t.id && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                {t.photos?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {t.photos.map((url, i) => <img key={i} src={url} alt="" className="h-20 w-20 object-cover rounded-lg" />)}
                  </div>
                )}
                {t.problems && <p className="text-sm text-neutral-500">Problems: {t.problems}</p>}
                {t.description && <p className="text-sm text-neutral-500">{t.description}</p>}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Estimated Value</label>
                    <input type="number" className="input" defaultValue={t.estimated_value || ''} onBlur={(e) => handleUpdate(t.id, { estimated_value: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="label">Offered Value</label>
                    <input type="number" className="input" defaultValue={t.offered_value || ''} onBlur={(e) => handleUpdate(t.id, { offered_value: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={t.status} onChange={(e) => handleUpdate(t.id, { status: e.target.value })}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
