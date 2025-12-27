FROM node:22-alpine AS build

# Enable Corepack for Yarn 4.12.0
RUN corepack enable

WORKDIR /usr/src/app

# Copy package files and Yarn configuration
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies
RUN yarn install --frozen-lockfile

COPY ./ ./

ARG VITE_API_BASE_URL

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN yarn build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/dist .
CMD ["nginx", "-g", "daemon off;"]