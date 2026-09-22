import { createContext, useContext, useEffect, useState } from 'react'
import * as cartApi from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const [cart, setCart] = useState({ items: [], subtotal: 0 })

  const refresh = async () => {
    if (!currentUser) {
      setCart({ items: [], subtotal: 0 })
      return
    }

    try {
      const result = await cartApi.getCart()
      setCart(result)
    } catch {
      setCart({ items: [], subtotal: 0 })
    }
  }

  useEffect(() => {
    refresh()
  }, [currentUser])

  const addItem = async (productId, quantity = 1) => {
    await cartApi.addToCart(productId, quantity)
    await refresh()
  }

  const updateItem = async (productId, quantity) => {
    await cartApi.updateCartItem(productId, quantity)
    await refresh()
  }

  const removeItem = async (productId) => {
    await cartApi.removeCartItem(productId)
    await refresh()
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, itemCount, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
