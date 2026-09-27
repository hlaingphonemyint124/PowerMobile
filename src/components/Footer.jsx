import { Link } from 'react-router-dom'
import { Smartphone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16">
      <div className="container-page py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-bold text-lg mb-2"><Smartphone size={20} /> PhoneHub</div>
          <p className="text-neutral-500">New, pre-owned and refurbished phones — plus trade-ins done right.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Shop</h4>
          <ul className="space-y-1 text-neutral-500">
            <li><Link to="/shop/new">New Phones</Link></li>
            <li><Link to="/shop/pre-owned">Pre-Owned</Link></li>
            <li><Link to="/deals">Deals</Link></li>
            <li><Link to="/compare">Compare</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Sell &amp; Trade</h4>
          <ul className="space-y-1 text-neutral-500">
            <li><Link to="/trade-in">Trade-In</Link></li>
            <li><Link to="/sell-phone">Sell Your Phone</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="space-y-1 text-neutral-500">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/news">News</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} PhoneHub. All rights reserved.
      </div>
    </footer>
  )
}
