import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { updateProfile } from '../api/users.api'

export default function AccountProfile() {
  const { profile, refreshProfile } = useAuth()
  const toast = useToast()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(profile.id, { full_name: fullName, phone })
      await refreshProfile()
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="card p-6 max-w-md space-y-4">
      <div><label className="label">Email</label><input className="input" value={profile?.email || ''} disabled /></div>
      <div><label className="label">Full Name</label><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
      <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
    </form>
  )
}
