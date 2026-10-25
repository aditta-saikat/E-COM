import { ShieldCheck, Sparkles, Store, Package } from 'lucide-react'

const DEFAULT_HIGHLIGHTS = [
  { icon: Package, text: 'Browse a growing catalog of real shops' },
  { icon: Store, text: 'Open your own shop in minutes' },
  { icon: ShieldCheck, text: 'Verified sellers, reviewed by admins' },
]

const AuthShell = ({ badge, heading, subheading, highlights = DEFAULT_HIGHLIGHTS, children }) => (
  <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-10">
    <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative hidden flex-col justify-center overflow-hidden bg-linear-to-br from-indigo-100 via-sky-100 to-cyan-100 px-10 py-14 text-slate-900 lg:col-span-2 lg:flex dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950 dark:text-slate-100">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 dark:bg-white/10 dark:text-indigo-200 dark:ring-white/10">
            <Sparkles size={13} />
            {badge}
          </span>
          <h2 className="font-display mt-5 text-3xl leading-tight font-extrabold tracking-tight">{heading}</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{subheading}</p>

          <ul className="mt-8 space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-indigo-600 ring-1 ring-indigo-200 dark:bg-white/10 dark:text-indigo-300 dark:ring-white/10">
                  <Icon size={14} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex animate-fade-in-up flex-col justify-center px-8 py-12 sm:px-14 lg:col-span-3">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
    </div>
  </div>
)

export default AuthShell
