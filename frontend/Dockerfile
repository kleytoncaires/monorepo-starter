FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/
RUN yarn install --frozen-lockfile

FROM base AS builder
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY frontend ./frontend
COPY package.json yarn.lock ./
WORKDIR /app/frontend
RUN yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
