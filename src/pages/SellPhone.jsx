import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { submitSellRequest } from '../api/sellRequests.api'
import { uploadTradeInPhoto } from '../api/tradeins.api'

export default function SellPhone() {
  const [form, setForm] = useState({
    brand: '', model: '', storage: '', color: '', condition: 'good', batteryHealth: 90,
    problems: '', description: '', contactName: '', contactPhone: '', photos: [],
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function handlePhotoUpload(e) {
    if (!user) { toast.info('Sign in to upload photos'); return }
    const files = Array.from(e.target.files || [])
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => uploadTradeInPhoto(f, user.id)))
      set('photos', [...form.photos, ...urls])
    } catch {
      toast.error('Photo upload failed')
    } finally { setUploading(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) { toast.info('Sign in to submit'); navigate('/login', { state: { from: { pathname: '/sell-phone' } } }); return }
    setSubmitting(true)
    try {
      await submitSellRequest({
        user_id: user.id, brand: form.brand, model: form.model, storage: form.storage, color: form.color,
        condition: form.condition, battery_health: form.batteryHealth, problems: form.problems,
        description: form.description, photos: form.photos, contact_name: form.contactName, contact_phone: form.contactPhone,
        status: 'submitted',
      })
      toast.success('Sell request submitted')
      navigate('/account/sell-requests')
    } catch {
      toast.error('Could not submit request')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Sell Your Phone</h1>
      <p className="text-neutral-500 mb-6">Tell us about your device and we&apos;ll get back to you with an offer.</p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} required /></div>
          <div><label className="label">Model</label><input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} required /></div>
          <div><label className="label">Storage</label><input className="input" value={form.storage} onChange={(e) => set('storage', e.target.value)} /></div>
          <div><label className="label">Color</label><input className="input" value={form.color} onChange={(e) => set('color', e.target.value)} /></div>
          <div>
            <label className="label">Condition</label>
            <select className="input" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option>
            </select>
          </div>
          <div><label className="label">Battery Health (%)</label><input type="number" min="0" max="100" className="input" value={form.batteryHealth} onChange={(e) => set('batteryHealth', Number(e.target.value))} /></div>
        </div>
        <div><label className="label">Known Problems</label><textarea className="input" rows={2} value={form.problems} onChange={(e) => set('problems', e.target.value)} /></div>
        <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div>
          <label className="label">Photos</label>
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} />
          {form.photos.length > 0 && <p className="text-xs text-neutral-500 mt-1">{form.photos.length} photo(s) uploaded</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Contact Name</label><input className="input" value={form.contactName} onChange={(e) => set('contactName', e.target.value)} required /></div>
          <div><label className="label">Contact Phone</label><input className="input" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} required /></div>
        </div>
        <button className="btn-primary w-full" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
      </form>
    </div>
  )
}
