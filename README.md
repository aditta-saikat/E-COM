# E-COM

A microservice-based e-commerce platform (Daraz-style marketplace: browse, cart, checkout, payments, orders, and eventually seller accounts, reviews, search). Built as a learning project — each service is a small, independently deployable Node.js/Express app.

## Architecture

- **Style:** API Gateway + REST. A single gateway (not built yet) will be the one public entry point, proxying to internal services over HTTP. Internal services are not meant to be publicly exposed once the gateway exists.
- **Auth:** Firebase Authentication. Clients sign in with Firebase and send the ID token as `Authorization: Bearer <token>` to any protected route. Each service verifies the token itself with `firebase-admin` — there's no central auth check yet, and no shared package, so the verification middleware is copy-pasted per service (a known, deliberate trade-off in this flat repo layout).
- **Data:** MongoDB. All services currently point at one shared Atlas database (`e-commerce`); each service owns its own Mongoose model/collection within it (e.g. `users`, `products`) rather than a fully separate database per service.
- **Admin/roles:** Not enforced across services yet. `auth-service` stores a `role` field (`customer`/`admin`) locally, but that never reaches other services (Firebase tokens don't carry it), so for now every other service treats "authenticated" and "authorized" as the same thing, gated by resource ownership instead of role.

## Conventions every service follows

Each `<name>-service/` folder is self-contained:

```
<name>-service/
├── src/
│   ├── config/       # DB connection, Firebase admin init
│   ├── controllers/  # request/response handling
│   ├── middleware/   # auth checks, internal-only checks
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express routers
│   ├── services/     # business logic, DB queries
│   ├── app.js         # Express app: helmet, cors, json body parsing, routes, /health, 404 + error handlers
│   └── server.js      # loads .env, connects Mongo, starts listening on PORT
├── test/              # node:test + node:assert, no Jest/Mocha
├── Dockerfile          # node:20-alpine, npm ci --omit=dev, copy src, EXPOSE <port>
├── .dockerignore
├── .env.example
└── package.json        # scripts: start / dev / test
```

Every service also gets its own path-filtered GitHub Actions workflow at `.github/workflows/<name>-ci.yml`: a `test` job (npm ci && npm test) and a `build-and-push` job (main branch only) that builds the Dockerfile and pushes to `ghcr.io/<owner>/<name>:latest` + `:<sha>`.

## Services

### auth-service (port 3001)
Thin identity layer on top of Firebase Auth — not a custom JWT issuer. On first authenticated request, mirrors the Firebase user into a local `User` document (`firebaseUid`, `email`, `displayName`, `photoUrl`, `role`, `isActive`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | liveness check |
| GET | `/api/users/me` | Bearer | current user's profile (creates it on first login) |
| PATCH | `/api/users/me` | Bearer | update current user's profile |

### product-catalog-service (port 3002)
Owns products: browsing, CRUD, and stock. The source of truth for price and stock that other services will check against at checkout.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | liveness check |
| GET | `/api/products` | none | browse/search (`category`, `search`, `page`) |
| GET | `/api/products/:id` | none | product detail |
| POST | `/api/products` | Bearer | create a product (creator becomes the owner) |
| PATCH | `/api/products/:id` | Bearer, owner only | update a product |
| DELETE | `/api/products/:id` | Bearer, owner only | soft delete (`isActive: false`) |
| POST | `/api/products/verify` | internal API key | batch price/stock re-check, for order-service at checkout |
| POST | `/api/products/:id/stock/decrement` | internal API key | atomic, guarded stock reservation |
| POST | `/api/products/:id/stock/increment` | internal API key | rollback a reservation |

Price is stored as an integer in minor currency units (e.g. paisa), not a float, to avoid rounding issues once totals are computed across services. Internal-only endpoints are gated by an `X-Internal-Api-Key` header (shared secret, set via `INTERNAL_API_KEY`) rather than a user token, since they're not meant to be called by end users directly.

## Known issue / to do

- `auth-service/env-text.txt` is currently committed to git with real MongoDB and Firebase credentials. These need to be rotated (new Mongo password, regenerated Firebase service-account key) and the file removed from git history before this goes further.

## Roadmap

Planned build order for the core shopping loop: **product-catalog-service ✅ → cart-service → payment-service → order-service → api-gateway**.

- **cart-service** (port 3003) — per-user cart, checks items against product-catalog on add.
- **payment-service** (port 3005) — mock payment gateway behind a stable interface, swappable for a real provider later.
- **order-service** (port 3004) — checkout orchestrator: builds an order from the cart, re-verifies price/stock, reserves stock, charges via payment-service, clears the cart.
- **api-gateway** (port 3000) — single public entry point, reverse-proxies to every service above.

Deferred to a later phase: seller/vendor portal, product reviews, search, notifications, admin dashboard, frontend.
