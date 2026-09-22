import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PullCord } from 'pullcord'
import 'pullcord/pullcord.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import LoadingScreen from './components/LoadingScreen'
import { useTheme } from './context/ThemeContext'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const MyProducts = lazy(() => import('./pages/MyProducts'))
const MyShop = lazy(() => import('./pages/MyShop'))
const AdminShops = lazy(() => import('./pages/AdminShops'))
const AdminShopDetail = lazy(() => import('./pages/AdminShopDetail'))
const AdminOrders = lazy(() => import('./pages/AdminOrders'))
const AdminCarts = lazy(() => import('./pages/AdminCarts'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))

const App = () => {
  const { dark, toggleDark } = useTheme()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <PullCord onPull={toggleDark} pulled={dark} ariaLabel="Toggle dark mode" />

      <Navbar />

      <main className="flex flex-1 flex-col">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-shop"
              element={
                <RoleRoute roles={['customer', 'shop_admin']}>
                  <MyShop />
                </RoleRoute>
              }
            />
            <Route
              path="/my-products"
              element={
                <RoleRoute roles={['shop_admin']}>
                  <MyProducts />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/shops"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminShops />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/shops/:shopId"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminShopDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminOrders />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/carts"
              element={
                <RoleRoute roles={['admin']}>
                  <AdminCarts />
                </RoleRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default App
