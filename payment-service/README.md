# payment-service

Records payments through a pluggable provider. Only a mock provider exists today. Port **3005**. Internal only: every route needs `X-Internal-Api-Key`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/payments` | Body `{ orderId, userId, amount (integer, minor units), currency }`. `201` if `succeeded`, `402` if `failed`. Returns the payment record. |
| GET | `/api/payments/lookup?orderId=` | Payment for an order. |
| GET | `/api/payments/:id` | Payment by id. |

The mock provider succeeds for any amount greater than 0 and fails for an invalid amount. To add a real provider, create `src/providers/<name>.provider.js` exporting `charge({ amount, currency })`, register it in `src/services/payment.service.js` and set `PAYMENT_PROVIDER`.

## Environment

`PORT` (3005), `MONGODB_URI`, `INTERNAL_API_KEY` (same as the other services), `PAYMENT_PROVIDER` (`mock`), `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t payment-service . && docker run --env-file .env -p 3005:3005 payment-service
```

Do not expose this service publicly. It is protected only by the shared key.
