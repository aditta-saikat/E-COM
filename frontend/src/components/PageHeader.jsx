const PageHeader = ({ icon: Icon, title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-cyan-100 text-indigo-600 shadow-sm dark:from-indigo-500/15 dark:to-cyan-500/15 dark:text-indigo-300">
        <Icon size={22} />
      </span>
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
)

export default PageHeader
