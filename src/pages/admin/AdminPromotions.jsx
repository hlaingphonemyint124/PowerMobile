import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([])
  const [form, setForm] = useState({ name: '', discount_type: 'percentage', discount_value: '', start_date: '', end_date: '' })
  const toast = useToast()

  function load() { supabase.from('promotions').select('*').order('created_at', { ascending: false }).then(({ data }) => setPromotions(data || [])) }
  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    const { error } = await supabase.from('promotions').insert({
      name: form.name, discount_type: form.discount_type, discount_value: Number(form.discount_value),
      start_date: form.start_date || null, end_date: form.end_date || null,
    })
    if (error) { toast.error('Could not create promotion'); return }
    toast.success('Promotion created')
    setForm({ name: '', discount_type: 'percentage', discount_value: '', start_date: '', end_date: '' })
    load()
  }

  async function toggleActive(p) {
    await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Promotions</h1>
      <form onSubmit={handleCreate} className="card bg-white dark:bg-neutral-900 p-5 grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
        <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div>
          <label className="label">Discount Type</label>
          <select className="input" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="sale_price">Sale Price</option>
          </select>
        </div>
        <div><label className="label">Value</label><input type="number" className="input" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required /></div>
        <div className="flex gap-2">
          <div className="flex-1"><label className="label">Start</label><input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div className="flex-1"><label className="label">End</label><input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
        <button className="btn-primary sm:col-span-2">Create Promotion</button>
      </form>
      <div className="card bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {promotions.length === 0 ? <p className="p-4 text-neutral-500">No promotions yet.</p> : promotions.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 text-sm">
            <span>{p.name} — {p.discount_value}{p.discount_type === 'percentage' ? '%' : ' ฿'}</span>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={p.is_active} onChange={() => toggleActive(p)} /> Active</label>
          </div>
        ))}
      </div>
    </div>
  )
}
