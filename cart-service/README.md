# cart-service

One cart per user. Stores only `{ productId, quantity }` and fetches name, price, image and stock from product-catalog-service every time the cart is read, so prices are never stale. Port **3003**.

## Endpoints (all need a Bearer token)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/cart` | Hydrated cart `{ items, subtotal }`. Items whose product is gone or inactive are dropped. |
| POST | `/api/cart/items` | `{ productId, quantity >= 1 }`. Adds, or increases the quantity. `404` for an unknown product. |
| PATCH | `/api/cart/items/:productId` | `{ quantity }`. `0` removes the item. |
| DELETE | `/api/cart/items/:productId` | Remove one item. |
| DELETE | `/api/cart` | Empty the cart (`204`). Called by order-service after a successful payment. |
| GET | `/api/cart/admin` | Admin only. All non-empty carts, optional `?shopId=`. |

## Environment

`PORT` (3003), `MONGODB_URI`, `JWT_SECRET` (same as auth), `PRODUCT_CATALOG_URL` (e.g. `http://localhost:3002`), `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t cart-service . && docker run --env-file .env -p 3003:3003 cart-service
```
