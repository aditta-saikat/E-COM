# E-COM

A learning-project marketplace built as microservices. Customers browse and buy, sellers open shops and list products, admins approve shops and see all orders and carts.

## Architecture

| Service | Port | Responsibility | Docs |
| --- | --- | --- | --- |
| [auth-service](auth-service/README.md) | 3001 | Signup, login, JWT issuing, user profile, user roles | [README](auth-service/README.md) |
| [product-catalog-service](product-catalog-service/README.md) | 3002 | Shops (request/approve/reject), products, stock | [README](product-catalog-service/README.md) |
| [cart-service](cart-service/README.md) | 3003 | Per-user cart, hydrated with live product data | [README](cart-service/README.md) |
| [order-service](order-service/README.md) | 3004 | Checkout orchestration, order history | [README](order-service/README.md) |
| [payment-service](payment-service/README.md) | 3005 | Charges (mock provider), payment records | [README](payment-service/README.md) |
| [frontend](frontend/README.md) | 5173 | React + Vite single-page app | [README](frontend/README.md) |

Every backend is Express 5 + Mongoose, logs with pino, and exposes `GET /health`.

### How services talk to each other

```
frontend ──► auth-service            login / signup / profile
        ├──► product-catalog-service  shops + products
        ├──► cart-service ──► product-catalog-service   (reads product data)
        └──► order-service ─┬─► cart-service            (reads + clears cart, forwards user's JWT)
                            ├─► product-catalog-service (verify, decrement/increment stock; internal key)
                            └─► payment-service         (charge; internal key)

payment-service ──► order-service   (redirect payments: reports the result; internal key)
order-service   ──► cart-service    (clears a cart after a redirect payment; internal key)

product-catalog-service ──► auth-service   (sets role to shop_admin when a shop is approved; internal key)
```

### Authentication model

- **User requests:** `Authorization: Bearer <JWT>`. Auth-service signs the token (HS256, `JWT_SECRET`). The other services verify it with the **same** `JWT_SECRET`. The token carries `sub` (user id), `email` and `role`.
- **Service-to-service requests:** header `X-Internal-Api-Key: <INTERNAL_API_KEY>`. All services that receive internal calls share the same key.
- **Roles:** `customer`, `shop_admin`, `admin`.

### Checkout flow

1. order-service fetches the user's cart (forwarding their JWT).
2. It asks catalog to verify availability and current prices.
3. It creates the order as `pending_payment`, then decrements stock per item (atomic `$inc` guarded by `stock >= quantity`).
4. It calls payment-service. With the `mock` and `stripe` providers the answer is immediate: on success the order becomes `paid` and the cart is cleared, on failure stock is rolled back and the order is marked `payment_failed` (or `failed_stock`).
5. With **SSLCommerz** (a redirect gateway) payment-service returns a hosted-page URL instead. The order stays `pending_payment` with its stock reserved, and the browser is sent to SSLCommerz. After the customer pays, SSLCommerz sends them back to payment-service, which verifies the payment with SSLCommerz, tells order-service the result (paid, or stock released) and redirects the browser to `/orders/:id?payment=...`. Unfinished orders are cancelled after 30 minutes.

Prices are stored as integer **minor units** (e.g. paisa) everywhere.

## Becoming a seller (shop flow)

1. A **customer** opens **Open a shop** in the navbar (`/my-shop`) and submits a name and description. The shop is created as `pending` (one shop per user).
2. An **admin** opens **Admin** (`/admin/shops`), sees it under *Pending requests*, and approves or rejects it (with a reason).
3. On approval, product-catalog-service marks the shop `approved` and calls auth-service to change the owner's role to `shop_admin`.
4. The owner must **log in again**: the role lives inside the JWT, so the old token still says `customer`. The My shop page shows a banner with a "Log out now" button when this applies.
5. The owner now sees **My shop** and **My products** and can create products. A rejected shop shows the reason on My shop.

## Running locally

Requirements: Node 20+, a MongoDB instance (local or Atlas).

### Option 1: one command (recommended for development)

1. Copy each service's `.env.example` to `.env` and fill it in (see [Environment](#environment)). Also `cp frontend/.env.example frontend/.env`.
2. From the repo root:
   ```bash
   npm run install:all   # once: installs the root tool and every service
   npm run dev           # starts auth, catalog, cart, order, payment and the frontend
   ```
   Logs are prefixed and colour-coded per service. Ctrl+C stops everything. `npm run dev:backend` starts only the five backends.
3. Open http://localhost:5173.

### Option 2: Docker Compose

Runs all services, the frontend (served by nginx) and a local MongoDB with separate databases per service.

```bash
cp .env.example .env      # set JWT_SECRET and INTERNAL_API_KEY (and optionally VITE_IMGBB_API_KEY)
docker compose up --build # or: npm run docker:up
```

- The frontend is on http://localhost:5173 and the services on ports 3001 to 3005. Services call each other by name (e.g. `http://auth-service:3001`).
- Docker does **not** read the per-service `.env` files. Configuration comes from `docker-compose.yml` and the root `.env`.
- Services run with `NODE_ENV=production` (the dev-only `pino-pretty` logger is not installed in the images).
- The frontend's `VITE_*` URLs are baked in at build time, so rebuild (`docker compose up --build`) after changing them.
- Data lives in the `mongo-data` volume. `docker compose down -v` deletes it.

### Manual (one terminal per service)

```bash
cd auth-service && npm install && npm run dev            # 3001
cd product-catalog-service && npm install && npm run dev # 3002
cd cart-service && npm install && npm run dev            # 3003
cd order-service && npm install && npm run dev           # 3004
cd payment-service && npm install && npm run dev         # 3005
cd frontend && npm install && npm run dev                # 5173
```

`dotenv` only reads `.env` at startup, so **restart a service after changing its `.env`**. The same applies to the frontend's `.env` and Vite.

### Environment

| Variable | Must be identical in | Notes |
| --- | --- | --- |
| `JWT_SECRET` | auth, product-catalog, cart, order | Long random string |
| `INTERNAL_API_KEY` | auth, product-catalog, cart, order, payment | Long random string |
| `MONGODB_URI` | one value per service | One clean line. Prefer a separate database name per service |

For Docker, the shared values go in the root `.env` (see `.env.example`).

Never commit a real `.env`. Only `.env.example` files with placeholder values belong in git.

## CI and Docker

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) detects which folder changed (paths filter). On pushes to `main` it builds each changed service's Docker image and pushes it to GHCR as `:latest` and `:<sha>`. For the frontend it runs `npm ci`, `npm run lint` and `npm run build`. Each service has a `Dockerfile` (Node 20 Alpine, `npm ci --omit=dev`).

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `POST localhost:5173/api/... 404` | `frontend/.env` is missing, so API URLs are undefined and requests hit the Vite server. Copy `.env.example` to `.env` and restart Vite. |
| Login returns 500, log says `JWT_SECRET is not configured` | The service's `.env` lacks `JWT_SECRET`, or it was not restarted after editing. |
| Approving a shop returns 500 | `INTERNAL_API_KEY` differs between product-catalog and auth, or auth is not running. |
| Products page shows "Could not load products" | product-catalog-service is down or its `MONGODB_URI` is wrong. |
| Image upload says it is not configured | `VITE_IMGBB_API_KEY` is empty in `frontend/.env`. Restart Vite after setting it. |

## Known limitations

See the review notes in the project history. The main open items: no automated tests, no idempotency on checkout, roles are trusted from the JWT until it expires, rate limiting and `ALLOWED_ORIGINS` are configured but not yet wired in, and all services currently share one MongoDB database.
