import { useEffect, useState } from 'react'
import { listShops } from '../api/shops'

// One shared request for the whole session: product cards only need an id -> name lookup.
let shopNamesRequest = null

const loadShopNames = () => {
  if (!shopNamesRequest) {
    shopNamesRequest = listShops()
      .then((result) => Object.fromEntries(result.items.map((shop) => [shop._id, shop.name])))
      .catch(() => {
        shopNamesRequest = null
        return {}
      })
  }

  return shopNamesRequest
}

export const useShopNames = () => {
  const [names, setNames] = useState({})

  useEffect(() => {
    let active = true
    loadShopNames().then((result) => active && setNames(result))

    return () => {
      active = false
    }
  }, [])

  return names
}
