import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { submitTradeIn, uploadTradeInPhoto } from '../api/tradeins.api'

const STEPS = ['Brand', 'Model', 'Storage', 'Condition', 'Battery', 'Functionality', 'Review']

const FUNCTIONALITY_QUESTIONS = [
  { key: 'touchscreen', label: 'Does the touchscreen work?' },
  { key: 'faceId', label: 'Does Face ID work?' },
  { key: 'fingerprint', label: 'Does the fingerprint sensor work?' },
  { key: 'cameras', label: 'Do the cameras work?' },
  { key: 'charging', label: 'Does charging work?' },
  { key: 'speakers', label: 'Do the speakers work?' },
  { key: 'microphone', label: 'Does the microphone work?' },
  { key: 'carrierLocked', label: 'Is the device carrier locked?' },
  { key: 'screenDamaged', label: 'Is the screen damaged?' },
  { key: 'bodyDamaged', label: 'Is the body damaged?' },
]

export default function TradeIn() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    brand: '', model: '', storage: '', color: '', condition: 'good', batteryHealth: 90,
    functionality: {}, customerNotes: '', photos: [],
  })
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }
  function setFn(key, value) { setForm((f) => ({ ...f, functionality: { ...f.functionality, [key]: value } })) }
  function next() { setStep((s) => Math.min(s + 1, STEPS.length - 1)) }
  function back() { setStep((s) => Math.max(s - 1, 0)) }

  async function handlePhotoUpload(e) {
    if (!user) { toast.info('Sign in to upload photos'); return }
    const files = Array.from(e.target.files || [])
    setUploading(true)
    try {
      const urls = await Promise.all(files.map((f) => uploadTradeInPhoto(f, user.id)))
      set('photos', [...form.photos, ...urls])
    } catch {
      toast.error('Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit() {
    if (!user) { toast.info('Sign in to submit a trade-in'); navigate('/login', { state: { from: { pathname: '/trade-in' } } }); return }
    setSubmitting(true)
    try {
      await submitTradeIn({
        user_id: user.id,
        brand: form.brand, model: form.model, storage: form.storage, color: form.color,
        condition: form.condition, battery_health: form.batteryHealth,
        functionality: form.functionality, customer_notes: form.customerNotes, photos: form.photos,
        status: 'submitted',
      })
      toast.success('Trade-in request submitted')
      navigate('/account/trade-ins')
    } catch {
      toast.error('Could not submit trade-in request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Trade In Your Phone</h1>
      <p className="text-neutral-500 mb-6">Tell us about your device to get an estimated trade-in value.</p>

      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
        ))}
      </div>

      <div className="card p-6">
        {step === 0 && (
          <Field label="Brand"><input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. Apple" /></Field>
        )}
        {step === 1 && (
          <Field label="Model"><input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g. iPhone 13" /></Field>
        )}
        {step === 2 && (
          <>
            <Field label="Storage"><input className="input" value={form.storage} onChange={(e) => set('storage', e.target.value)} placeholder="e.g. 128GB" /></Field>
            <Field label="Color"><input className="input" value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="e.g. Midnight" /></Field>
          </>
        )}
        {step === 3 && (
          <Field label="Overall Condition">
            <select className="input" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="excellent">Excellent — like new</option>
              <option value="good">Good — light wear</option>
              <option value="fair">Fair — visible wear</option>
              <option value="poor">Poor — damaged</option>
            </select>
          </Field>
        )}
        {step === 4 && (
          <Field label={`Battery Health: ${form.batteryHealth}%`}>
            <input type="range" min="50" max="100" value={form.batteryHealth} onChange={(e) => set('batteryHealth', Number(e.target.value))} className="w-full" />
          </Field>
        )}
        {step === 5 && (
          <div className="space-y-3">
            {FUNCTIONALITY_QUESTIONS.map((q) => (
              <div key={q.key} className="flex items-center justify-between text-sm">
                <span>{q.label}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFn(q.key, true)} className={`px-3 py-1 rounded-lg text-xs ${form.functionality[q.key] === true ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-300 dark:border-neutral-700'}`}>Yes</button>
                  <button type="button" onClick={() => setFn(q.key, false)} className={`px-3 py-1 rounded-lg text-xs ${form.functionality[q.key] === false ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border border-neutral-300 dark:border-neutral-700'}`}>No</button>
                </div>
              </div>
            ))}
            <div>
              <label className="label mt-4">Upload Photos</label>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} />
              {form.photos.length > 0 && <p className="text-xs text-neutral-500 mt-1">{form.photos.length} photo(s) uploaded</p>}
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="text-sm space-y-2">
            <p><strong>{form.brand} {form.model}</strong> · {form.storage} · {form.color}</p>
            <p>Condition: {form.condition} · Battery: {form.batteryHealth}%</p>
            <textarea className="input mt-3" rows={3} placeholder="Any additional notes..." value={form.customerNotes} onChange={(e) => set('customerNotes', e.target.value)} />
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button type="button" onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-0">Back</button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary">Continue</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Trade-In'}</button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div className="mb-4"><label className="label">{label}</label>{children}</div>
}
