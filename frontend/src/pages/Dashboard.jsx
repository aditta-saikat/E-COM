import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Package, ShieldCheck, Store, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'

const QuickLink = ({ to, title, description, icon: Icon, accent }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
  >
    <ArrowUpRight
      size={16}
      className="absolute top-5 right-5 text-slate-300 transition group-hover:text-indigo-500"
    />
    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-white ${accent}`}>
      <Icon size={18} />
    </div>
    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </Link>
)

const QUICK_LINKS_BY_ROLE = {
  customer: [
    { to: '/products', title: 'Browse products', description: 'Search and explore the full catalog.', icon: Package, accent: 'bg-indigo-500' },
    { to: '/my-shop', title: 'Open a shop', description: 'Start selling your own products.', icon: Store, accent: 'bg-cyan-500' },
    { to: '/profile', title: 'Profile', description: 'View your account details.', icon: UserCircle, accent: 'bg-emerald-500' },
  ],
  shop_admin: [
    { to: '/products', title: 'Browse products', description: 'Search and explore the full catalog.', icon: Package, accent: 'bg-indigo-500' },
    { to: '/my-shop', title: 'My shop', description: 'View and edit your shop details.', icon: Store, accent: 'bg-cyan-500' },
    { to: '/my-products', title: 'My products', description: 'Create, edit, or remove your listings.', icon: Package, accent: 'bg-violet-500' },
    { to: '/profile', title: 'Profile', description: 'View your account details.', icon: UserCircle, accent: 'bg-emerald-500' },
  ],
  admin: [
    { to: '/products', title: 'Browse products', description: 'Search and explore the full catalog.', icon: Package, accent: 'bg-indigo-500' },
    { to: '/admin/shops', title: 'Pending shops', description: 'Review and approve shop requests.', icon: ShieldCheck, accent: 'bg-rose-500' },
    { to: '/profile', title: 'Profile', description: 'View your account details.', icon: UserCircle, accent: 'bg-emerald-500' },
  ],
}

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    listProducts()
      .then((result) => setRecentProducts(result.items.slice(0, 4)))
      .catch(() => {})
  }, [])

  const greetingName = currentUser?.displayName || currentUser?.email?.split('@')[0]
  const quickLinks = QUICK_LINKS_BY_ROLE[currentUser?.role] || QUICK_LINKS_BY_ROLE.customer

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-8 text-white shadow-md">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-medium text-indigo-100">Welcome back</p>
        <h1 className="font-display relative mt-1 text-2xl font-bold sm:text-3xl">
          Hey {greetingName} 👋
        </h1>
        <p className="relative mt-2 max-w-lg text-indigo-100">
          Here's your dashboard — browse the catalog, manage your own listings, or update your
          profile.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <QuickLink key={link.to} {...link} />
        ))}
      </div>

      {recentProducts.length > 0 && (
        <div className="mt-10 animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">Recently added</h2>
            <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group rounded-lg border border-slate-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-400 transition group-hover:text-indigo-500">
                  <Package size={28} strokeWidth={1.5} />
                </div>
                <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
