import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-neutral-500 mb-6">Looks like this page went offline.</p>
      <Link to="/" className="btn-primary">Back to Store</Link>
    </div>
  )
}
