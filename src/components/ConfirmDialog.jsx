export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-sm p-5 bg-white dark:bg-neutral-900">
        <h3 className="font-semibold text-lg">{title}</h3>
        {message && <p className="text-sm text-neutral-500 mt-2">{message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button
            className={`btn ${danger ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
