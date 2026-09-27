import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'
import PageLoader from '../../components/PageLoader'

export default function AdminSettings() {
  const [settings, setSettings] = useState(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { supabase.from('settings').select('*').eq('id', 1).single().then(({ data }) => setSettings(data)) }, [])

  function set(field, value) { setSettings((s) => ({ ...s, [field]: value })) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('settings').update(settings).eq('id', 1)
    setSaving(false)
    if (error) toast.error('Could not save settings')
    else toast.success('Settings saved')
  }

  if (!settings) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      <form onSubmit={handleSave} className="card bg-white dark:bg-neutral-900 p-6 space-y-4 max-w-xl">
        <div><label className="label">Store Name</label><input className="input" value={settings.store_name || ''} onChange={(e) => set('store_name', e.target.value)} /></div>
        <div><label className="label">Contact Email</label><input className="input" value={settings.contact_email || ''} onChange={(e) => set('contact_email', e.target.value)} /></div>
        <div><label className="label">Contact Phone</label><input className="input" value={settings.contact_phone || ''} onChange={(e) => set('contact_phone', e.target.value)} /></div>
        <div><label className="label">Address</label><input className="input" value={settings.address || ''} onChange={(e) => set('address', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Shipping Fee (฿)</label><input type="number" className="input" value={settings.shipping_fee || 0} onChange={(e) => set('shipping_fee', Number(e.target.value))} /></div>
          <div><label className="label">Tax (%)</label><input type="number" className="input" value={settings.tax_percent || 0} onChange={(e) => set('tax_percent', Number(e.target.value))} /></div>
        </div>
        <div><label className="label">Store Description</label><textarea className="input" rows={3} value={settings.store_description || ''} onChange={(e) => set('store_description', e.target.value)} /></div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  )
}
