import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import PageLoader from '../../components/PageLoader'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(null)

  useEffect(() => {
    supabase.from('notifications').select('*').is('user_id', null).order('created_at', { ascending: false }).limit(50)
      .then(({ data }) => setNotifications(data || []))
  }, [])

  if (notifications === null) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="card bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {notifications.length === 0 ? <p className="p-4 text-neutral-500">No notifications.</p> : notifications.map((n) => (
          <div key={n.id} className="p-3 text-sm">
            <p className="font-medium">{n.title}</p>
            <p className="text-neutral-500">{n.message}</p>
            <p className="text-xs text-neutral-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
