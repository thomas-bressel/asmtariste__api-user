# Stage 1: Build
FROM node:22 AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src/
RUN npm ci
RUN npm run build

# Stage 2: Production
FROM node:22
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 5002
CMD ["npm", "start"]