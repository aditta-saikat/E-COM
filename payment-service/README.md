# payment-service

Records payments through a pluggable provider: `mock` (default, no real calls) or `stripe` (Stripe **test mode**). Port **3005**. Internal only: every route needs `X-Internal-Api-Key`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/payments` | Body `{ orderId, userId, amount (integer, minor units), currency }`. `201` if `succeeded`, `402` if `failed`. Returns the payment record. |
| GET | `/api/payments/lookup?orderId=` | Payment for an order. |
| GET | `/api/payments/:id` | Payment by id. |

## Providers

**mock**: succeeds for any amount greater than 0 and fails for an invalid amount. Nothing leaves your machine.

**stripe** (`src/providers/stripe.provider.js`): creates and confirms a PaymentIntent server-side using a Stripe *test* payment method (default `pm_card_visa`), so no card form is needed. The payment shows up in the Stripe dashboard (test mode) as "E-COM order <id>", with the order ID in its metadata. Setup:

1. Get a test secret key from https://dashboard.stripe.com/test/apikeys (it starts with `sk_test_`).
2. In `payment-service/.env` set `PAYMENT_PROVIDER=stripe` and `STRIPE_SECRET_KEY=sk_test_...`, then restart the service.
3. Place an order in the app, then open https://dashboard.stripe.com/test/payments (test mode on).

To test a decline, set `STRIPE_TEST_PAYMENT_METHOD=pm_card_chargeDeclined` (other test methods: https://docs.stripe.com/testing). Live keys are rejected on purpose. The idempotency key is the order ID, so retrying an order never charges twice. Stripe enforces a minimum charge per currency, and your account must support the currency (BDT may not be enabled for every account; if Stripe rejects it, the order is marked `payment_failed`).

This is a server-side test integration. A production checkout needs the customer to enter their own card (Stripe Elements or hosted Checkout) plus a webhook.

To add another provider, create `src/providers/<name>.provider.js` exporting `charge({ orderId, amount, currency })`, register it in `src/services/payment.service.js` and set `PAYMENT_PROVIDER`.

## Environment

`PORT` (3005), `MONGODB_URI`, `INTERNAL_API_KEY` (same as the other services), `PAYMENT_PROVIDER` (`mock` or `stripe`), `STRIPE_SECRET_KEY`, `STRIPE_TEST_PAYMENT_METHOD`, `LOG_LEVEL`, `NODE_ENV`.

## Run

```bash
npm install && npm run dev
docker build -t payment-service . && docker run --env-file .env -p 3005:3005 payment-service
```

Do not expose this service publicly. It is protected only by the shared key.
