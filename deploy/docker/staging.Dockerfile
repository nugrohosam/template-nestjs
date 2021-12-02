# Download dependencies the application step
FROM node:14-alpine AS deps
ENV NODE_ENV staging
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --forzen-lockfile

# Build the application step
FROM node:14-alpine AS build
ENV NODE_ENV staging
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build \
  && npm install --prefer-offline

WORKDIR /app
RUN addgroup -g 1001 -S polpa \
	&& adduser -S polpa -u 1001 \
  && chown -Rf polpa.polpa /app
USER polpa
EXPOSE 4000
CMD ["npm", "run", "start"]
