export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
      ))}
    </tr>
  )
}
