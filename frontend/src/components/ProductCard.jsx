import { Link } from 'react-router-dom'

const formatPrice = (minorUnits, currency) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(minorUnits / 100)

const ProductCard = ({ product }) => (
  <Link
    to={`/products/${product._id}`}
    className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="mb-3 aspect-square rounded-md bg-linear-to-br from-indigo-100 to-cyan-100" />
    <h3 className="font-medium text-slate-900">{product.name}</h3>
    <p className="text-sm text-slate-500">{product.category}</p>
    <p className="mt-2 font-semibold text-slate-900">
      {formatPrice(product.price, product.currency)}
    </p>
  </Link>
)

export default ProductCard
