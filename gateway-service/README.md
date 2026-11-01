# gateway-service

The **API gateway**: one public door in front of all the services. The browser only ever talks to
`http://localhost:3000`; the gateway decides which service handles each request, and which requests are allowed through at all.

```
browser ──► gateway :3000 ──► auth-service      :3001   /api/auth, /api/users
                          ├─► catalog-service   :3002   /api/products, /api/shops
                          ├─► cart-service      :3003   /api/cart
                          ├─► order-service     :3004   /api/orders
                          └─► payment-service   :3005   /api/payments/sslcommerz/*  (callbacks only)
```

## What a gateway is, and why you use one

A gateway is a **reverse proxy with opinions**. It receives every client request, applies rules shared by all services,
then forwards the request to the service that owns that URL. The service answers, and the gateway passes the answer back.

What it gives you:

| Benefit | Without a gateway | With this gateway |
| --- | --- | --- |
| **One URL** | The frontend knows 4 service URLs and every service needs CORS | One URL, one CORS policy |
| **Routing** | The client decides which service to call | The gateway maps `/api/orders/...` to order-service |
| **Hiding internals** | Service-to-service endpoints (stock, payment results, cart clearing) are on the public internet, guarded only by a shared key | They are blocked: the gateway answers 404, the request never reaches the service |
| **Early auth** | A bad token travels all the way to a service before being rejected | Rejected at the door with 401 |
| **Rate limiting** | Each service would need its own | One place, with a stricter limit on login/signup |
| **Safe logging** | pino-http in each service logged the full `Authorization` header | The gateway redacts tokens and the internal key |
| **Tracing** | Five unrelated logs | One `X-Request-Id` follows a request into every service |
| **Resilience** | A down service gives the browser a network error | A clean `502`/`504` JSON error |

What it costs: one more hop (a few ms), one more thing to deploy, and it becomes a single point of failure. That is why
gateways stay thin: they route and protect, they never contain business logic.

## How a request travels

Each step either passes the request on or ends it. The order is in [src/app.js](src/app.js):

1. **requestId**: assigns `X-Request-Id`.
2. **logging** (pino-http): logs the request with secrets redacted.
3. **helmet + CORS**: security headers; only `CORS_ORIGINS` may call from a browser.
4. **stripInternalHeaders**: deletes `X-Internal-Api-Key` from the incoming request, so an outsider can never present the internal key.
5. **rate limiting**: 300 requests/minute/IP, and 20/minute for login and signup.
6. **accessControl** ([src/middleware/accessControl.js](src/middleware/accessControl.js)): looks the route up in the route table:
   - not under any service prefix: `404`
   - `blocked` (internal only): `404`
   - `public`: forward as is
   - everything else: needs a valid JWT, else `401`
7. **proxy** ([src/proxy.js](src/proxy.js)): streams the request to the service and streams the answer back. If the service is down: `502`, if it hangs: `504`.

The gateway **does not parse the request body**, it just streams it through. That is why it never needs to know about your
JSON shapes, and why SSLCommerz's form posts pass through untouched.

The services still verify the JWT themselves. The gateway check is an extra layer (defence in depth), not a replacement.

## The route table

Defined in [src/config/routes.js](src/config/routes.js). Rules are checked in order and the first match wins:

| Access | Routes |
| --- | --- |
| **blocked** (service-to-service only) | `POST /api/products/verify`, `POST /api/products/:id/stock/increment\|decrement`, `POST /api/orders/:id/payment-result`, `/api/cart/internal/*`, every `/api/payments/*` except the SSLCommerz callbacks |
| **public** | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/products`, `GET /api/products/categories`, `GET /api/products/:id`, `GET /api/shops`, `GET /api/shops/:id`, `/api/payments/sslcommerz/(success\|fail\|cancel\|ipn)` |
| **authenticated** (default) | everything else under a service prefix |

Role checks (customer, shop_admin, admin) stay in the services, because they own that business rule.

Note that the services still call **each other directly** (order-service to catalog, cart, payment). A gateway fronts
*external* traffic (north-south); it does not sit between internal calls (east-west).

## Try it

With everything running (`npm run dev` from the repo root):

```bash
curl -i localhost:3000/health                          # gateway + every service behind it
curl -i localhost:3000/api/products                    # public: proxied to the catalog
curl -i localhost:3000/api/cart                        # 401: no token, stopped at the gateway
curl -i -X POST localhost:3000/api/products/verify     # 404: internal route, blocked
curl -i localhost:3000/api/payments/anything           # 404: blocked
```

Look at the `X-Request-Id` response header, the `RateLimit` headers, and the gateway's log line for each request
(there is no `authorization` value in it). Hammer `/api/auth/login` more than 20 times in a minute to see a `429`.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Listen port |
| `JWT_SECRET` | none, required | Same secret as the services; used to verify tokens |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma separated list of allowed browser origins |
| `AUTH_SERVICE_URL`, `PRODUCT_CATALOG_URL`, `CART_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL` | `localhost:3001` to `3005` | Where each service lives |
| `RATE_LIMIT_PER_MINUTE` | `300` | Per IP, all routes |
| `AUTH_RATE_LIMIT_PER_MINUTE` | `20` | Per IP, login and signup |

## Run

```bash
cp .env.example .env   # set JWT_SECRET to the same value the services use
npm install
npm run dev
```

## Adding a new service or route

1. Add the service and its URL prefix to `SERVICES` in [src/config/routes.js](src/config/routes.js).
2. If any of its routes are public or internal-only, add a rule to `RULES`. Anything not listed requires a token.
3. Add its URL variable to `.env.example` and docker-compose.

## Limitations

- The rate limiter keeps counts in memory, so with more than one gateway instance each has its own count. Use a shared store (Redis) when you scale out.
- There is no response caching, request aggregation or circuit breaker. Those are common gateway features you could add next.
- The SSLCommerz callbacks still default to `PUBLIC_PAYMENT_URL=http://localhost:3005` (direct). Point it at the gateway (`http://localhost:3000`) to send callbacks through it as well.
