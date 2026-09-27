import { useState } from 'react'
import { useToast } from '../contexts/ToastContext'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const toast = useToast()
  function handleSubmit(e) {
    e.preventDefault()
    toast.success('Message sent — we will get back to you shortly.')
    setForm({ name: '', email: '', message: '' })
  }
  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
        <div><label className="label">Message</label><textarea className="input" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
        <button className="btn-primary w-full">Send Message</button>
      </form>
    </div>
  )
}
