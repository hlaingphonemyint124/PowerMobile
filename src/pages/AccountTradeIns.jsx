import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getMyTradeIns } from '../api/tradeins.api'
import EmptyState from '../components/EmptyState'
import PageLoader from '../components/PageLoader'

export default function AccountTradeIns() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  useEffect(() => { if (user) getMyTradeIns(user.id).then(setItems).catch(() => setItems([])) }, [user])

  if (items === null) return <PageLoader />
  if (items.length === 0) return <EmptyState title="You don't have any trade-in requests." action={<Link to="/trade-in" className="btn-primary">Start a Trade-In</Link>} />

  return (
    <div className="space-y-3">
      {items.map((t) => (
        <div key={t.id} className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{t.brand} {t.model}</p>
            <p className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            {t.offered_value ? <p className="font-semibold">฿{t.offered_value}</p> : <p className="text-xs text-neutral-500">Est. ฿{t.estimated_value ?? '—'}</p>}
            <span className="text-xs capitalize text-neutral-500">{t.status.replace('_', ' ')}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
