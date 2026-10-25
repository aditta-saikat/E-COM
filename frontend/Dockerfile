FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values at build time, so they are passed as build args.
ARG VITE_AUTH_SERVICE_URL=http://localhost:3001
ARG VITE_PRODUCT_CATALOG_URL=http://localhost:3002
ARG VITE_CART_SERVICE_URL=http://localhost:3003
ARG VITE_ORDER_SERVICE_URL=http://localhost:3004
ARG VITE_IMGBB_API_KEY=
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
