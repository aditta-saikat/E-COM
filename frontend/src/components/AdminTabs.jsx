import { NavLink } from 'react-router-dom'
import { ClipboardList, ShoppingCart, Store } from 'lucide-react'

const tabs = [
  { to: '/admin/shops', label: 'Shops', icon: Store },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/carts', label: 'Carts', icon: ShoppingCart },
]

const AdminTabs = () => (
  <div className="mb-6 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
    {tabs.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
          }`
        }
      >
        <Icon size={15} />
        {label}
      </NavLink>
    ))}
  </div>
)

export default AdminTabs
