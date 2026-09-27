import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PageLoader from './PageLoader'

export default function AdminRoute({ children, staffOk = true }) {
  const { user, loading, isAdmin, isStaff } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/admin/login" replace />
  const allowed = staffOk ? isStaff : isAdmin
  if (!allowed) return <Navigate to="/" replace />
  return children
}
