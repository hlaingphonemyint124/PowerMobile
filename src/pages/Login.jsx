import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn({ email, password })
      toast.success('Welcome back')
      navigate(location.state?.from?.pathname || '/account')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-page py-16 max-w-sm">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div><label className="label">Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="text-sm text-neutral-500 mt-4">
        <Link to="/forgot-password" className="text-accent">Forgot password?</Link>
      </p>
      <p className="text-sm text-neutral-500 mt-2">
        Don&apos;t have an account? <Link to="/register" className="text-accent">Register</Link>
      </p>
    </div>
  )
}
