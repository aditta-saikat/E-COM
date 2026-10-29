import { useEffect, useState } from 'react'
import { createProduct, deleteProduct, listAllProducts, updateProduct } from '../api/products'
import { getMyShop } from '../api/shops'
import { Package } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ProductsManager from '../components/ProductsManager'

const MyProducts = () => {
  const [products, setProducts] = useState([])

  const load = async () => {
    const shop = await getMyShop()
    setProducts(await listAllProducts({ shopId: shop._id }))
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (payload) => {
    await createProduct(payload)
    await load()
  }

  const handleUpdate = async (id, payload) => {
    await updateProduct(id, payload)
    await load()
  }

  const handleDelete = async (id) => {
    await deleteProduct(id)
    await load()
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up px-6 py-8">
      <PageHeader
        icon={Package}
        title="My products"
        subtitle={`${products.length} ${products.length === 1 ? 'listing' : 'listings'} in your shop. Click the pencil to edit one.`}
      />

      <ProductsManager
        products={products}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        emptyMessage="You haven't added any products yet."
      />
    </div>
  )
}

export default MyProducts
