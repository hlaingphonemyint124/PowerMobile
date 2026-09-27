import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMySellRequests } from '../api/sellRequests.api'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'

export default function AccountSellRequests() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  useEffect(() => { if (user) getMySellRequests(user.id).then(setItems).catch(() => setItems([])) }, [user])

  if (items === null) return <PageLoader />
  if (items.length === 0) return <EmptyState title="You haven't submitted any sell requests." action={<Link to="/sell-phone" className="btn-primary">Sell Your Phone</Link>} />

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div key={s.id} className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{s.brand} {s.model}</p>
            <p className="text-xs text-neutral-500">{new Date(s.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {s.offered_value ? <p className="font-semibold">฿{s.offered_value}</p> : <p className="text-xs text-neutral-500">Est. ฿{s.estimated_value ?? '—'}</p>}
            <span className="text-xs capitalize text-neutral-500">{s.status.replace('_', ' ')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
