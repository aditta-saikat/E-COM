import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <Link
        to="/"
        className="bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-lg font-bold text-transparent"
      >
        E-COM
      </Link>

      <div className="flex items-center gap-5 text-sm">
        <Link to="/products" className="font-medium text-slate-600 hover:text-slate-900">
          Products
        </Link>

        {currentUser ? (
          <>
            {currentUser.role === 'admin' && (
              <Link to="/admin/shops" className="font-medium text-slate-600 hover:text-slate-900">
                Admin
              </Link>
            )}
            {(currentUser.role === 'customer' || currentUser.role === 'shop_admin') && (
              <Link to="/my-shop" className="font-medium text-slate-600 hover:text-slate-900">
                {currentUser.role === 'shop_admin' ? 'My shop' : 'Open a shop'}
              </Link>
            )}
            {(currentUser.role === 'shop_admin' || currentUser.role === 'admin') && (
              <Link to="/my-products" className="font-medium text-slate-600 hover:text-slate-900">
                My products
              </Link>
            )}
            <Link to="/profile" className="font-medium text-slate-600 hover:text-slate-900">
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-slate-900 px-3.5 py-1.5 font-medium text-white transition hover:bg-slate-700"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-medium text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
