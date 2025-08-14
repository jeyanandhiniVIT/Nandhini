# Stage 1: Build frontend
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # outputs /app/dist

# Stage 2: Set up backend
FROM node:20
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend code
COPY backend ./backend

# Copy frontend build into backend
COPY --from=builder /app/dist ./backend/dist/public

# Build backend TypeScript
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Final container config
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server.js"]
