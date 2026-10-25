import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Package, ShieldCheck, Store, UserCircle } from 'lucide-react'
import { Blinds } from 'feral-blinds'
import 'feral-blinds/blinds.css'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'
import { formatPrice } from '../lib/formatPrice'

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
}

const ROLE_LABELS = { customer: 'Customer', shop_admin: 'Shop admin', admin: 'Admin' }

const ROLE_SUBTITLES = {
  customer: 'Browse the catalog, track your orders, or open a shop of your own.',
  shop_admin: 'Manage your shop and listings, and see what is new in the marketplace.',
  admin: 'Review shop requests and keep an eye on orders and carts.',
}

const QuickLink = ({ to, title, description, icon: Icon, tone }) => (
  <Link
    to={to}
    className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
  >
    <ArrowUpRight
      size={16}
      className="absolute top-5 right-5 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600"
    />
    <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${TONES[tone]}`}>
      <Icon size={20} />
    </span>
    <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
  </Link>
)

const BROWSE = { to: '/products', title: 'Browse products', description: 'Search and explore the full catalog.', icon: Package, tone: 'indigo' }
const PROFILE = { to: '/profile', title: 'Profile', description: 'Update your name and photo.', icon: UserCircle, tone: 'emerald' }

const QUICK_LINKS_BY_ROLE = {
  customer: [
    BROWSE,
    { to: '/my-shop', title: 'Open a shop', description: 'Start selling your own products.', icon: Store, tone: 'cyan' },
    PROFILE,
  ],
  shop_admin: [
    BROWSE,
    { to: '/my-shop', title: 'My shop', description: 'View and edit your shop details.', icon: Store, tone: 'cyan' },
    { to: '/my-products', title: 'My products', description: 'Create, edit or remove your listings.', icon: Package, tone: 'violet' },
    PROFILE,
  ],
  admin: [
    BROWSE,
    { to: '/admin/shops', title: 'Manage shops', description: 'Review requests and browse every shop.', icon: ShieldCheck, tone: 'rose' },
    PROFILE,
  ],
}

const hueFromString = (value) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360
  }
  return hash
}

const Dashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    listProducts()
      .then((result) => setRecentProducts(result.items.slice(0, 10)))
      .catch(() => {})
  }, [])

  const greetingName = currentUser?.displayName || currentUser?.email?.split('@')[0]
  const role = ROLE_LABELS[currentUser?.role] ? currentUser.role : 'customer'
  const quickLinks = QUICK_LINKS_BY_ROLE[role]

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-indigo-100 via-sky-100 to-cyan-100 px-8 py-10 dark:border-slate-800 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-linear-to-br from-indigo-400 to-cyan-400 text-2xl font-semibold text-white shadow-sm dark:border-slate-800 dark:from-indigo-500 dark:to-cyan-600">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              greetingName?.[0]?.toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-white/70 px-3 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/10">
              {ROLE_LABELS[role]}
            </span>
            <h1 className="font-display mt-2 truncate text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
              Welcome back, {greetingName}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">{ROLE_SUBTITLES[role]}</p>
          </div>
        </div>
      </div>

      <h2 className="font-display mt-10 mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Quick actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <QuickLink key={link.to} {...link} />
        ))}
      </div>

      {recentProducts.length > 0 && (
        <div className="mt-12 animate-fade-in-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Recently added</h2>
            <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              View all →
            </Link>
          </div>

          <div style={{ height: 520 }}>
            <Blinds
              items={recentProducts.map((product) => ({
                title: product.name,
                subtitle: product.description || product.category,
                meta: formatPrice(product.price, product.currency),
                image: product.images?.[0],
                hue: hueFromString(product.category || product._id),
              }))}
              mode="fold"
              labelStyle="steady"
              labelPosition="bottom"
              radius={20}
              gap={12}
              textSize={1.05}
              expandRatio={1.35}
              tuning={{ k: 120, c: 18, lean: 0.3, squeeze: 1 }}
              autoPlay={3200}
              showIndex={false}
              showBody
              onActivate={(i) => navigate(`/products/${recentProducts[i]._id}`)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
