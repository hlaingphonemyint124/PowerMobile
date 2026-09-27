import { useEffect, useState } from 'react'
import { listAdminCustomers, toggleCustomerDisabled } from '../../api/users.api'
import { useToast } from '../../contexts/ToastContext'
import PageLoader from '../../components/PageLoader'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null)
  const [search, setSearch] = useState('')
  const toast = useToast()

  function load() { listAdminCustomers({ search }).then(setCustomers).catch(() => setCustomers([])) }
  useEffect(() => { setCustomers(null); load() }, [search])

  async function handleToggle(c) {
    try { await toggleCustomerDisabled(c.id, !c.is_disabled); load(); toast.success('Customer updated') }
    catch { toast.error('Could not update customer') }
  }

  if (customers === null) return <PageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <input className="input max-w-sm mb-4" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="card bg-white dark:bg-neutral-900 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody>
            {customers.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-neutral-500">No customers found.</td></tr> :
              customers.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-3">{c.full_name || '—'}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || '—'}</td>
                  <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{c.is_disabled ? <span className="text-red-500">Disabled</span> : <span className="text-green-600">Active</span>}</td>
                  <td className="p-3"><button onClick={() => handleToggle(c)} className="btn-outline !text-xs !py-1">{c.is_disabled ? 'Enable' : 'Disable'}</button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
