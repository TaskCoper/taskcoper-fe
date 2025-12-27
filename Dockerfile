FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN corepack enable && yarn install --frozen-lockfile

COPY ./ ./

ARG VITE_API_BASE_URL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/dist .
CMD ["nginx", "-g", "daemon off;"]