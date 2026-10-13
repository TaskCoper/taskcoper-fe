FROM node:22-alpine AS build

# Enable Corepack for Yarn 4.12.0
RUN corepack enable

WORKDIR /usr/src/app

# Copy package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./
COPY .husky/install.mjs ./.husky/install.mjs

# Install dependencies
RUN yarn install --frozen-lockfile

COPY ./ ./

ARG API_BASE_URL
ARG FILE_BASE_URL
ARG APP_BASE_URL
ARG GOONG_MAP_API_KEY
ARG GOONG_MAP_TILE_API_KEY
ARG VIETMAP_API_KEY
ARG VIETMAP_MAP_API_KEY

ENV VITE_API_BASE_URL=${API_BASE_URL}
ENV VITE_FILE_BASE_URL=${FILE_BASE_URL}
ENV VITE_APP_BASE_URL=${APP_BASE_URL}
ENV VITE_GOONG_MAP_API_KEY=${GOONG_MAP_API_KEY}
ENV VITE_GOONG_MAP_TILE_API_KEY=${GOONG_MAP_TILE_API_KEY}
ENV VITE_VIETMAP_API_KEY=${VIETMAP_API_KEY}
ENV VITE_VIETMAP_MAP_API_KEY=${VIETMAP_MAP_API_KEY}

ARG SENTRY_RELEASE
ARG SENTRY_ENVIRONMENT
ARG SENTRY_AUTH_TOKEN

ENV VITE_SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}

# Plugin Sentry upload source map ngay trong yarn build, nên xoá sau đó để nginx không phục vụ .map công khai
RUN yarn build && find dist -name '*.map' -delete

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/dist .
CMD ["nginx", "-g", "daemon off;"]
