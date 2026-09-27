import { PackageOpen } from 'lucide-react'

export default function EmptyState({ icon: Icon = PackageOpen, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <Icon size={40} className="text-neutral-400 mb-3" />
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-neutral-500 text-sm mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
