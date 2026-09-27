import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()
  const toast = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Could not send reset email')
    }
  }

  return (
    <div className="container-page py-16 max-w-sm">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      {sent ? (
        <p className="text-sm text-neutral-500">If an account exists for {email}, a reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <button className="btn-primary w-full">Send Reset Link</button>
        </form>
      )}
    </div>
  )
}
