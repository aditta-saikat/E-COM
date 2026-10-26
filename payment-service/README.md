# payment-service

Records payments through a pluggable provider: `mock` (default, no real calls), `stripe` (Stripe **test mode**) or `sslcommerz` (sandbox or live). Port **3005**. Internal only: every route needs `X-Internal-Api-Key`, except the SSLCommerz callbacks, which must be reachable by the customer's browser.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/payments` | Body `{ orderId, userId, amount (integer, minor units), currency }`. `201` if `succeeded`, `402` if `failed`. Returns the payment record. |
| ANY | `/api/payments/sslcommerz/success`, `/fail`, `/cancel`, `/ipn` | Public callbacks called by SSLCommerz (see below). Never trusted without verification. |
| GET | `/api/payments/lookup?orderId=` | Payment for an order. |
| GET | `/api/payments/:id` | Payment by id. |

## Providers

**mock**: succeeds for any amount greater than 0 and fails for an invalid amount. Nothing leaves your machine.

**stripe** (`src/providers/stripe.provider.js`): creates and confirms a PaymentIntent server-side using a Stripe *test* payment method (default `pm_card_visa`), so no card form is needed. The payment shows up in the Stripe dashboard (test mode) as "E-COM order <id>", with the order ID in its metadata. Setup:

1. Get a test secret key from https://dashboard.stripe.com/test/apikeys (it starts with `sk_test_`).
2. In `payment-service/.env` set `PAYMENT_PROVIDER=stripe` and `STRIPE_SECRET_KEY=sk_test_...`, then restart the service.
3. Place an order in the app, then open https://dashboard.stripe.com/test/payments (test mode on).

To test a decline, set `STRIPE_TEST_PAYMENT_METHOD=pm_card_chargeDeclined` (other test methods: https://docs.stripe.com/testing). Live keys are rejected on purpose. The idempotency key is the order ID, so retrying an order never charges twice. Stripe enforces a minimum charge per currency, and your account must support the currency (BDT may not be enabled for every account; if Stripe rejects it, the order is marked `payment_failed`).

**sslcommerz** (`src/providers/sslcommerz.provider.js`): a redirect gateway. Setup:

1. Create a free sandbox account at https://developer.sslcommerz.com/registration/ and copy the store ID and store password they email you.
2. In `payment-service/.env` set `PAYMENT_PROVIDER=sslcommerz`, `SSLCOMMERZ_STORE_ID=...`, `SSLCOMMERZ_STORE_PASSWORD=...`, and restart. `SSLCOMMERZ_IS_LIVE` stays `false` for the sandbox. Keep `PUBLIC_PAYMENT_URL` (where the browser reaches this service), `FRONTEND_URL` and `ORDER_SERVICE_URL` correct.
3. Place an order. The browser is redirected to the SSLCommerz sandbox page. Pay with a test card or mobile-banking method from https://developer.sslcommerz.com/doc/v4/#sandbox-testing and you land back on the order page.

How it works:

1. `POST /api/payments` creates a `pending` payment and calls SSLCommerz's session API with the payment ID as `tran_id`. It answers `202` with `redirectUrl` (SSLCommerz's hosted page). If SSLCommerz refuses the session, the payment is `failed` and the answer is `402`.
2. The customer pays on SSLCommerz. SSLCommerz sends the browser to `/sslcommerz/success|fail|cancel` (and calls `/ipn` server to server).
3. On a success claim the service **verifies the `val_id` with SSLCommerz's validation API** and checks the transaction ID, amount and currency against the stored payment. Only then is the payment `succeeded`.
4. The payment moves from `pending` atomically (callback and IPN can arrive together), then order-service is told through `POST /api/orders/:id/payment-result`, and the browser is redirected to `FRONTEND_URL/orders/:id?payment=success|failed|cancelled|pending`.

Limits: the IPN can only reach this service if `PUBLIC_PAYMENT_URL` is public (use a tunnel such as ngrok). On localhost the success redirect still completes the payment because it is verified directly. If SSLCommerz's validation API is unreachable during the callback, the payment stays `pending`, and the unpaid order is cancelled after 30 minutes. If a customer pays after that, order-service logs an error: refund or reconcile it in the SSLCommerz dashboard.

The Stripe provider is a server-side test integration. A production checkout needs the customer to enter their own card (Stripe Elements or hosted Checkout) plus a webhook.

To add another provider, create `src/providers/<name>.provider.js` exporting `charge({ orderId, amount, currency })`, register it in `src/services/payment.service.js` and set `PAYMENT_PROVIDER`.

## Environment

`PORT` (3005), `MONGODB_URI`, `INTERNAL_API_KEY` (same as the other services), `PAYMENT_PROVIDER` (`mock`, `stripe` or `sslcommerz`), `STRIPE_SECRET_KEY`, `STRIPE_TEST_PAYMENT_METHOD`, `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE`, `PUBLIC_PAYMENT_URL`, `FRONTEND_URL`, `ORDER_SERVICE_URL`, `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t payment-service . && docker run --env-file .env -p 3005:3005 payment-service
```

Do not expose this service publicly. It is protected only by the shared key.
