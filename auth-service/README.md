# auth-service

Accounts, login and user roles. Issues the JWTs that every other service verifies. Port **3001**.

Stack: Express 5, Mongoose, bcryptjs, jsonwebtoken, express-validator, pino.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | none | Body `{ email, password (min 6), displayName? }`. Returns `201 { token, user }`. `409` if the email exists. |
| POST | `/api/auth/login` | none | Body `{ email, password }`. Returns `{ token, user }`. `401` on bad credentials. |
| GET | `/api/users/me` | Bearer | Current user. |
| PATCH | `/api/users/me` | Bearer | Update `displayName` and/or `avatarUrl`. |
| PATCH | `/api/users/:id/role` | `X-Internal-Api-Key` | Body `{ role }` (`customer`, `shop_admin`, `admin`). Called by product-catalog-service when a shop is approved. |
| GET | `/health` | none | Liveness. |

`user` in responses: `{ _id, email, displayName, avatarUrl, role }`. Passwords are bcrypt-hashed and never returned.

### Profile photo (`avatarUrl`)

The frontend uploads the image to ImgBB and sends only the resulting link. `PATCH /api/users/me` accepts `avatarUrl` as an `https://` URL (max 2048 chars). An empty string removes the photo. Any other value returns `400`.

## Environment

| Variable | Description |
| --- | --- |
| `PORT` | Default 3001 |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret. Must match auth, catalog, cart and order |
| `JWT_EXPIRES_IN` | Default `7d` |
| `INTERNAL_API_KEY` | Shared key for internal calls |
| `LOG_LEVEL`, `NODE_ENV` | Logging / mode |
| `ALLOWED_ORIGINS`, `RATE_LIMIT_*` | Present in the example file but not yet used by the code |

## Run

```bash
npm install
npm run dev     # nodemon
npm start       # production
docker build -t auth-service . && docker run --env-file .env -p 3001:3001 auth-service
```

## Code layout

`src/routes` → `src/controllers` → `src/services` → `src/models`. `src/middleware` has `requireAuth` (verifies the JWT and loads the user, rejecting inactive accounts) and `requireInternalKey`.
