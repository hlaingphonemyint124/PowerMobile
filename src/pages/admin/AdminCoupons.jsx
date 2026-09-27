import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', minimum_order: '', usage_limit: '' })
  const toast = useToast()

  function load() { supabase.from('coupons').select('*').order('created_at', { ascending: false }).then(({ data }) => setCoupons(data || [])) }
  useEffect(load, [])

  async function handleCreate(e) {
    e.preventDefault()
    const { error } = await supabase.from('coupons').insert({
      code: form.code.toUpperCase(), discount_type: form.discount_type, discount_value: Number(form.discount_value),
      minimum_order: form.minimum_order ? Number(form.minimum_order) : 0,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    })
    if (error) { toast.error(error.message.includes('duplicate') ? 'Coupon code already exists' : 'Could not create coupon'); return }
    toast.success('Coupon created')
    setForm({ code: '', discount_type: 'percentage', discount_value: '', minimum_order: '', usage_limit: '' })
    load()
  }

  async function toggleActive(c) {
    await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Coupons</h1>
      <form onSubmit={handleCreate} className="card bg-white dark:bg-neutral-900 p-5 grid sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
        <div><label className="label">Code</label><input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></div>
        <div>
          <label className="label">Discount Type</label>
          <select className="input" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
            <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
          </select>
        </div>
        <div><label className="label">Discount Value</label><input type="number" className="input" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required /></div>
        <div><label className="label">Minimum Order (฿)</label><input type="number" className="input" value={form.minimum_order} onChange={(e) => setForm({ ...form, minimum_order: e.target.value })} /></div>
        <div><label className="label">Usage Limit</label><input type="number" className="input" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
        <button className="btn-primary sm:col-span-2">Create Coupon</button>
      </form>
      <div className="card bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {coupons.length === 0 ? <p className="p-4 text-neutral-500">No coupons yet.</p> : coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-3 text-sm">
            <span>{c.code} — {c.discount_value}{c.discount_type === 'percentage' ? '%' : ' ฿'} · used {c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ''}</span>
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={c.is_active} onChange={() => toggleActive(c)} /> Active</label>
          </div>
        ))}
      </div>
    </div>
  )
}
