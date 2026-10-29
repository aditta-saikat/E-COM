import { useShopNames } from '../lib/useShopNames'

const hueFromString = (value) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360
  }
  return hash
}

// "Sold by" pill: a coloured initial (colour derived from the shop name) next to the shop name.
const ShopBadge = ({ shopId, className = '' }) => {
  const name = useShopNames()[shopId]

  if (!name) return null

  const hue = hueFromString(name)

  return (
    <span
      title={`Sold by ${name}`}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/90 py-0.5 pr-3 pl-0.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur dark:bg-slate-900/85 dark:text-slate-200 dark:ring-slate-700 ${className}`}
    >
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 75% 45%))` }}
      >
        {name[0].toUpperCase()}
      </span>
      <span className="truncate">{name}</span>
    </span>
  )
}

export default ShopBadge
