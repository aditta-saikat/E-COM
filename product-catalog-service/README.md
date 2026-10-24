# product-catalog-service

Shops and products, plus the stock operations used by checkout. Port **3002**.

## Concepts

- A user **requests a shop** (`pending`). An admin **approves** it (user becomes `shop_admin` via auth-service) or **rejects** it with a reason.
- Only an approved shop's owner (or an admin) can create products. A product belongs to a shop (`shopId`) and records its creator (`createdBy`).
- `price` is an integer in minor units. `DELETE` is a soft delete (`isActive=false`).

## Endpoints

### Products

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/products` | none | Query: `search`, `category`, `shopId`, `page` (20 per page). Returns `{ items, total, page, pageSize }`. |
| GET | `/api/products/:id` | none | One active product. |
| POST | `/api/products` | Bearer, `shop_admin` or `admin` | Body `{ name, price, sku, stock?, category?, images?, description? }`. Admins must also send `shopId`. |
| PATCH | `/api/products/:id` | Bearer (owner or admin) | Update a product. |
| DELETE | `/api/products/:id` | Bearer (owner or admin) | Soft delete. |
| POST | `/api/products/verify` | internal key | `{ items: [{ productId, quantity }] }` → availability and current price. |
| POST | `/api/products/:id/stock/decrement` | internal key | `{ quantity }`. Atomic; `409` if insufficient. |
| POST | `/api/products/:id/stock/increment` | internal key | `{ quantity }`. Used to roll back. |

`images` is an array of URLs. The frontend uploads images to ImgBB and stores the returned link in `images[0]`.

### Shops

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/shops` | optional | Approved shops. Admins get all shops. |
| GET | `/api/shops/pending` | admin | Pending requests. |
| GET | `/api/shops/mine` | Bearer | The caller's shop. |
| GET | `/api/shops/:id` | none | An approved shop. |
| POST | `/api/shops` | Bearer | Request a shop `{ name, description? }`. One per user. |
| PATCH | `/api/shops/:id` | Bearer (owner or admin) | Update a shop. |
| POST | `/api/shops/:id/approve` | admin | Approve and promote the owner. |
| POST | `/api/shops/:id/reject` | admin | Reject with `{ reason? }`. |

## Environment

`PORT` (3002), `MONGODB_URI`, `JWT_SECRET` (same as auth), `INTERNAL_API_KEY` (same as auth/order), `AUTH_SERVICE_URL` (e.g. `http://localhost:3001`), `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t product-catalog-service . && docker run --env-file .env -p 3002:3002 product-catalog-service
```
