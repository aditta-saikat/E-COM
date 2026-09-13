import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listProducts } from '../api/products'

const QuickLink = ({ to, title, description, accent }) => (
  <Link
    to={to}
    className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className={`mb-3 h-1.5 w-10 rounded-full ${accent}`} />
    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
  </Link>
)

const Dashboard = () => {
  const { currentUser } = useAuth()
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    listProducts()
      .then((result) => setRecentProducts(result.items.slice(0, 4)))
      .catch(() => {})
  }, [])

  const greetingName = currentUser?.displayName || currentUser?.email?.split('@')[0]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-8 text-white shadow-md">
        <p className="text-sm font-medium text-indigo-100">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Hey {greetingName} 👋</h1>
        <p className="mt-2 text-indigo-100">
          Here's your dashboard — browse the catalog, manage your own listings, or update your
          profile.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink
          to="/products"
          title="Browse products"
          description="Search and explore the full catalog."
          accent="bg-indigo-500"
        />
        <QuickLink
          to="/my-products"
          title="My products"
          description="Create, edit, or remove your listings."
          accent="bg-cyan-500"
        />
        <QuickLink
          to="/profile"
          title="Profile"
          description="View your account details."
          accent="bg-emerald-500"
        />
      </div>

      {recentProducts.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recently added</h2>
            <Link to="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="rounded-lg border border-slate-200 bg-white p-3 transition hover:shadow-md"
              >
                <div className="mb-2 aspect-square rounded-md bg-linear-to-br from-indigo-100 to-cyan-100" />
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
