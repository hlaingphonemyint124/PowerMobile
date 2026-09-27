import { useEffect, useState } from 'react'
import { listAdminReviews, moderateReview } from '../../api/reviews.api'
import { useToast } from '../../contexts/ToastContext'
import PageLoader from '../../components/PageLoader'

export default function AdminReviews() {
  const [reviews, setReviews] = useState(null)
  const toast = useToast()

  function load() { listAdminReviews().then(setReviews).catch(() => setReviews([])) }
  useEffect(load, [])

  async function handleModerate(id, status) {
    try { await moderateReview(id, status); load(); toast.success('Review updated') }
    catch { toast.error('Could not update review') }
  }

  if (reviews === null) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-neutral-500">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{r.products?.name}</p>
                <p className="text-xs text-neutral-500">{r.profiles?.full_name} · {'★'.repeat(r.rating)}</p>
              </div>
              <span className="text-xs capitalize px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{r.status}</span>
            </div>
            <p className="text-sm mt-2">{r.comment}</p>
            {r.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleModerate(r.id, 'approved')} className="btn-primary !text-xs !py-1">Approve</button>
                <button onClick={() => handleModerate(r.id, 'rejected')} className="btn-outline !text-xs !py-1">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
