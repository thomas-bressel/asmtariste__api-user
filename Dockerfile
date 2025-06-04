#Stage 1: Build
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY src/ ./src/
COPY tsconfig.json ./
RUN pnpm run build

# Stage 2: Production
FROM node:22-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod
COPY --from=builder /app/dist ./dist
EXPOSE 5002
CMD ["pnpm", "start"]
