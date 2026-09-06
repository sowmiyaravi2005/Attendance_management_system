# Multi-stage Dockerfile for Mini Attendance Management System

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Runner
FROM node:20-alpine
WORKDIR /app

# Copy Backend files
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY database/ ./database/

# Copy built frontend assets to backend static directory
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "backend/src/app.js"]
