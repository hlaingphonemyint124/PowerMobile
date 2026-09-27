import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <form onSubmit={handleSubmit} className="card bg-neutral-900 border-neutral-800 text-white p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">PhoneHub Admin</h1>
        <div><label className="label !text-neutral-300">Email</label><input type="email" className="input !bg-neutral-800 !border-neutral-700 !text-white" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label !text-neutral-300">Password</label><input type="password" className="input !bg-neutral-800 !border-neutral-700 !text-white" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn-primary w-full !bg-white !text-neutral-900" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
    </div>
  )
}
