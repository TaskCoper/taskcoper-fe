FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Accept VITE_API_BASE_URL as build argument (required)
ARG VITE_API_BASE_URL
# Validate that VITE_API_BASE_URL is set during build
RUN if [ -z "$VITE_API_BASE_URL" ]; then \
    echo "ERROR: VITE_API_BASE_URL build argument is required but not set. Please provide it when building the image."; \
    exit 1; \
  fi
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy only package.json and yarn.lock (exclude package-lock.json)
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./ ./
RUN yarn build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
COPY --from=build /usr/src/app/dist .
CMD ["nginx", "-g", "daemon off;"]