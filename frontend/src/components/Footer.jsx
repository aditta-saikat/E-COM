import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
  const { currentUser } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-indigo-600 to-cyan-600 text-white">
                <ShoppingBag size={14} strokeWidth={2.25} />
              </span>
              <span className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                E-COM
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              A marketplace where anyone can browse, sell, and manage their own shop.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Marketplace</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                  Browse products
                </Link>
              </li>
              <li>
                <Link to="/my-shop" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                  Open a shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              {currentUser ? (
                <>
                  <li>
                    <Link to="/profile" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                      Dashboard
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                      Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {year} E-COM. Built as a learning project.
        </div>
      </div>
    </footer>
  )
}

export default Footer
