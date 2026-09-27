import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  const toast = {
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error'),
    info: (m) => push(m, 'info'),
  }

  const icons = { success: CheckCircle2, error: XCircle, info: Info }
  const colors = {
    success: 'border-green-500/40 text-green-700 dark:text-green-400',
    error: 'border-red-500/40 text-red-700 dark:text-red-400',
    info: 'border-blue-500/40 text-blue-700 dark:text-blue-400',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div key={t.id} className={`card border ${colors[t.type]} shadow-lg px-4 py-3 flex items-start gap-2`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm flex-1 text-neutral-800 dark:text-neutral-100">{t.message}</p>
              <button onClick={() => remove(t.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
