import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listProducts, getProductById } from '../api/products.api'

const FIELDS = [
  { key: 'price', label: 'Price', format: (v) => `฿${v}` },
  { key: 'brands.name', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'condition', label: 'Condition' },
  { key: 'condition_grade', label: 'Grade' },
  { key: 'storage', label: 'Storage' },
  { key: 'ram', label: 'RAM' },
  { key: 'color', label: 'Color' },
  { key: 'battery_health', label: 'Battery', format: (v) => (v ? `${v}%` : '—') },
  { key: 'warranty', label: 'Warranty' },
]

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj) ?? '—'
}

export default function Compare() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [selected, setSelected] = useState(['', '', ''])

  useEffect(() => {
    listProducts({ page: 1 }).then((r) => setAllProducts(r.data)).catch(() => setAllProducts([]))
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []
    if (ids.length) {
      Promise.all(ids.slice(0, 3).map(getProductById)).then((prods) => {
        setProducts(prods)
        setSelected([prods[0]?.id || '', prods[1]?.id || '', prods[2]?.id || ''])
      })
    }
  }, [searchParams])

  async function handleSelect(index, id) {
    const next = [...selected]
    next[index] = id
    setSelected(next)
    if (!id) {
      const p2 = [...products]; p2[index] = null; setProducts(p2)
      return
    }
    const product = await getProductById(id)
    const p2 = [...products]; p2[index] = product; setProducts(p2)
  }

  const active = products.filter(Boolean)

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-bold mb-6">Compare Phones</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <select key={i} className="input" value={selected[i]} onChange={(e) => handleSelect(i, e.target.value)}>
            <option value="">Select a phone...</option>
            {allProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ))}
      </div>

      {active.length === 0 ? (
        <p className="text-neutral-500 text-center py-16">Select up to 3 phones above to compare.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 border-b border-neutral-200 dark:border-neutral-800">Spec</th>
                {active.map((p) => <th key={p.id} className="text-left p-3 border-b border-neutral-200 dark:border-neutral-800">{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((f) => (
                <tr key={f.key}>
                  <td className="p-3 border-b border-neutral-100 dark:border-neutral-900 text-neutral-500">{f.label}</td>
                  {active.map((p) => (
                    <td key={p.id} className="p-3 border-b border-neutral-100 dark:border-neutral-900">
                      {f.format ? f.format(get(p, f.key)) : get(p, f.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
