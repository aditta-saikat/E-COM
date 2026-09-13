import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  Store,
  UserCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-cyan-600 text-white shadow-sm shadow-indigo-600/40">
            <ShoppingBag size={17} strokeWidth={2.25} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            E-COM
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          <NavLink to="/products" className={linkClass}>
            <Package size={16} />
            <span className="hidden sm:inline">Products</span>
          </NavLink>

          {currentUser ? (
            <>
              <NavLink to="/" end className={linkClass}>
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>

              {currentUser.role === 'admin' && (
                <NavLink to="/admin/shops" className={linkClass}>
                  <Shield size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </NavLink>
              )}

              {(currentUser.role === 'customer' || currentUser.role === 'shop_admin') && (
                <NavLink to="/my-shop" className={linkClass}>
                  <Store size={16} />
                  <span className="hidden sm:inline">
                    {currentUser.role === 'shop_admin' ? 'My shop' : 'Open a shop'}
                  </span>
                </NavLink>
              )}

              {(currentUser.role === 'shop_admin' || currentUser.role === 'admin') && (
                <NavLink to="/my-products" className={linkClass}>
                  <Package size={16} />
                  <span className="hidden sm:inline">My products</span>
                </NavLink>
              )}

              <NavLink to="/profile" className={linkClass}>
                <UserCircle size={16} />
                <span className="hidden sm:inline">Profile</span>
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="ml-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
