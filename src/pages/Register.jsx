import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signUp({ email, password, fullName })
      toast.success('Account created — check your email to confirm, then sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-16 max-w-sm">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Full Name</label><input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label">Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p className="text-sm text-neutral-500 mt-4">
        Already have an account? <Link to="/login" className="text-accent">Sign in</Link>
      </p>
    </div>
  )
}
