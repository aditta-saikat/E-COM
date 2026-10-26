# order-service

Runs checkout and stores order history. Port **3004**.

## Checkout (`POST /api/orders`)

1. Get the user's cart from cart-service (the user's JWT is forwarded).
2. Verify items and current prices with product-catalog-service.
3. Create the order as `pending_payment`, then decrement stock per item.
4. Charge via payment-service.
5. On success: order `paid`, cart cleared. On failure: stock rolled back, order `payment_failed` or `failed_stock`.

**Redirect gateways (SSLCommerz):** payment-service answers with a `redirectUrl` instead of a final result. The order stays `pending_payment` (with `awaitingPayment: true`), stock stays reserved, the cart is kept, and `POST /api/orders` returns the order plus `paymentUrl`; the frontend sends the customer there. Payment-service then calls `POST /api/orders/:id/payment-result` (internal key) with `succeeded`, `failed` or `cancelled`:
- `succeeded` → order `paid`, cart cleared (through cart-service's internal endpoint).
- `failed` / `cancelled` → stock released, order `payment_failed` / `cancelled`, cart kept so the customer can retry.

The transition is atomic and idempotent. A background job runs every 5 minutes and cancels orders still waiting after 30 minutes, releasing their stock.

Order totals use catalog prices, never client-supplied values.

## Endpoints (Bearer token)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/orders` | Body `{ shippingAddress: { fullName, phone, address } }`. `201` with the order. Errors: `400` empty cart, `409` unavailable or out of stock, `402` payment declined. |
| GET | `/api/orders` | The caller's orders. |
| GET | `/api/orders/:id` | One order. Owner or admin only. |
| POST | `/api/orders/:id/payment-result` | Internal key only. Body `{ paymentId, status }`. Called by payment-service. |
| GET | `/api/orders/admin` | Admin only. Optional `?status=` and `?shopId=`. |

Order statuses: `pending_payment`, `paid`, `payment_failed`, `failed_stock`, `cancelled`.

## Environment

`PORT` (3004), `MONGODB_URI`, `JWT_SECRET` (same as auth), `INTERNAL_API_KEY` (same as auth/catalog/payment), `CART_SERVICE_URL`, `PRODUCT_CATALOG_URL`, `PAYMENT_SERVICE_URL`, `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t order-service . && docker run --env-file .env -p 3004:3004 order-service
```

## Known gaps

No idempotency key on checkout, and a crash between stock decrement and payment result needs manual reconciliation. Failed stock rollbacks are logged as errors.
