# -------- Stage 1: Build Frontend --------
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files and install ALL dependencies (dev + prod)
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY frontend ./

# Optional: disable TS unused errors if needed
# RUN npx tsc --noEmit --skipLibCheck || true

# Build frontend
RUN npm run build

# -------- Stage 2: Setup Backend --------
FROM python:3.9-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend ./

# Copy built frontend into backend's static folder
COPY --from=frontend-build /app/frontend/dist ./static

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose backend port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run FastAPI backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
