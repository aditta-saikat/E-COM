import { Link } from 'react-router-dom'

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10">
    <div className="flex w-full flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-500 dark:from-indigo-500/15 dark:to-cyan-500/15 dark:text-indigo-300">
        <Icon size={28} />
      </span>
      <h1 className="font-display mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && (
        <Link
          to={action.to}
          className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 dark:bg-indigo-500/90 dark:hover:bg-indigo-500"
        >
          {action.label}
        </Link>
      )}
    </div>
  </div>
)

export default EmptyState
