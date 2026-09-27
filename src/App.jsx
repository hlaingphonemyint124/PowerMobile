import { Routes, Route } from 'react-router-dom'
import CustomerLayout from './components/CustomerLayout'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Customer pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import BrandPage from './pages/BrandPage'
import Compare from './pages/Compare'
import TradeIn from './pages/TradeIn'
import SellPhone from './pages/SellPhone'
import Deals from './pages/Deals'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Account from './pages/Account'
import AccountOrders from './pages/AccountOrders'
import AccountOrderDetail from './pages/AccountOrderDetail'
import AccountWishlist from './pages/AccountWishlist'
import AccountTradeIns from './pages/AccountTradeIns'
import AccountSellRequests from './pages/AccountSellRequests'
import AccountProfile from './pages/AccountProfile'
import NotFound from './pages/NotFound'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminTradeIns from './pages/admin/AdminTradeIns'
import AdminSellRequests from './pages/admin/AdminSellRequests'
import AdminNews from './pages/admin/AdminNews'
import AdminNewsForm from './pages/admin/AdminNewsForm'
import AdminBrands from './pages/admin/AdminBrands'
import AdminCategories from './pages/admin/AdminCategories'
import AdminPromotions from './pages/admin/AdminPromotions'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminReviews from './pages/admin/AdminReviews'
import AdminNotifications from './pages/admin/AdminNotifications'
import AdminSettings from './pages/admin/AdminSettings'

export default function App() {
  return (
    <Routes>
      {/* Admin login is outside the AdminLayout so it doesn't show the sidebar */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="trade-ins" element={<AdminTradeIns />} />
        <Route path="trade-ins/:id" element={<AdminTradeIns />} />
        <Route path="sell-requests" element={<AdminSellRequests />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="news/new" element={<AdminNewsForm />} />
        <Route path="news/:id/edit" element={<AdminNewsForm />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/new" element={<Shop />} />
        <Route path="/shop/pre-owned" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/brand/:brand" element={<BrandPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/trade-in" element={<TradeIn />} />
        <Route path="/sell-phone" element={<SellPhone />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>}>
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetail />} />
          <Route path="wishlist" element={<AccountWishlist />} />
          <Route path="trade-ins" element={<AccountTradeIns />} />
          <Route path="sell-requests" element={<AccountSellRequests />} />
          <Route path="profile" element={<AccountProfile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
