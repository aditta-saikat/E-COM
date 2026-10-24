# frontend

React 19 + Vite + Tailwind CSS 4 single-page app. Talks directly to the backend services with axios. Dev server on **5173**.

## Setup

```bash
cp .env.example .env     # required. Without it every API call goes to the Vite server and returns 404
npm install
npm run dev              # restart after editing .env
npm run lint
npm run build
```

### Environment

| Variable | Description |
| --- | --- |
| `VITE_AUTH_SERVICE_URL` | e.g. `http://localhost:3001` |
| `VITE_PRODUCT_CATALOG_URL` | e.g. `http://localhost:3002` |
| `VITE_CART_SERVICE_URL` | e.g. `http://localhost:3003` |
| `VITE_ORDER_SERVICE_URL` | e.g. `http://localhost:3004` |
| `VITE_IMGBB_API_KEY` | ImgBB key for image uploads (https://api.imgbb.com/) |

Anything prefixed `VITE_` is bundled into the browser code, so the ImgBB key is visible to users. Acceptable for a learning project. For production, proxy uploads through a backend.

## Structure

```
src/api/          axios clients per service (api/client.js) and request helpers
src/context/      Auth, Cart and Theme providers
src/components/   Navbar, Footer, Modal, AuthShell, FormField, ImageUploader, product/admin tables
src/pages/        route components
src/lib/          token storage (localStorage), price formatting, ImgBB upload
```

## Routes

Public: `/` (landing, or home when signed in), `/products`, `/products/:id`, `/login`, `/signup`.
Signed in: `/profile`, `/cart`, `/checkout`, `/orders`, `/orders/:id`.
Shop admin: `/my-shop`, `/my-products`.
Admin: `/admin/shops`, `/admin/shops/:shopId`, `/admin/orders`, `/admin/carts`.

## Shared UI

- **AuthShell**: the split card layout (soft gradient brand panel + form) used by Login and Signup. It sits in the same `max-w-6xl` column as the navbar and footer.
- **FormField**: labelled input with an optional icon, hint and a show/hide toggle for passwords.
- **ImageUploader**: controlled image picker (see below).

## Image uploads (ImgBB)

Used for the profile photo (Profile → Edit) and product images (add/edit product).

1. The user picks a file. [`validateImage`](src/lib/imgbb.js) checks it: JPG, PNG, GIF or WebP, at most 5 MB, at least 100×100 px. A bad file shows an error and is not accepted.
2. An accepted file shows as a **local preview** only. Nothing is uploaded. **Undo** restores the saved image and **Remove** marks it for removal.
3. When the user clicks **Save changes** or **Create product**, `resolveImageUrl` uploads the file to ImgBB and returns its link, which is saved with the form (`avatarUrl` on the user, `images[0]` on the product). An upload failure stops the save and shows the error.
4. Cancelling discards everything with no upload.

Replaced or removed images stay on ImgBB (the free API cannot delete them). Only the saved link changes.

## Tokens

The JWT is stored in `localStorage` (`ecom_token`) and attached to every request by the axios interceptor. This is simple but readable by any XSS. An httpOnly cookie would be safer for production.
