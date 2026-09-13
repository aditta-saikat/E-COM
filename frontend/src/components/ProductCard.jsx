import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

const formatPrice = (minorUnits, currency) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(minorUnits / 100)

const ProductCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="relative flex aspect-square items-center justify-center bg-linear-to-br from-indigo-50 to-cyan-50 text-indigo-300 transition group-hover:text-indigo-400">
      <Package size={36} strokeWidth={1.5} />
      {product.stock <= 3 && product.stock > 0 && (
        <span className="absolute top-2 right-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          Low stock
        </span>
      )}
      {product.stock === 0 && (
        <span className="absolute top-2 right-2 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
          Out of stock
        </span>
      )}
    </div>
    <div className="p-4">
      <h3 className="truncate font-medium text-slate-900 group-hover:text-indigo-600">
        {product.name}
      </h3>
      <p className="text-sm text-slate-500 capitalize">{product.category}</p>
      <p className="mt-2 font-semibold text-slate-900">
        {formatPrice(product.price, product.currency)}
      </p>
    </div>
  </Link>
)

export default ProductCard
