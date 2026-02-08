# Quickstart: Local Kubernetes Deployment of Todo Chatbot

**Feature**: 005-k8s-deployment
**Date**: 2026-01-25 (Updated)
**Status**: Deployment Complete

## Prerequisites

Ensure the following tools are installed:

| Tool | Version | Verification Command |
|------|---------|---------------------|
| Docker Desktop | Latest | `docker info` |
| Minikube | 1.30+ | `minikube version` |
| kubectl | 1.28+ | `kubectl version --client` |
| Helm | 3.x | `helm version` |

**Note**: kubectl-ai and Kagent are optional AI-assisted tools. The deployment works without them.

## Step 1: Start Minikube Cluster

```bash
# Start Minikube with Docker driver (reduced resources for local dev)
minikube start --driver=docker --cpus=2 --memory=3500

# Verify cluster is running
kubectl cluster-info

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify nodes
kubectl get nodes
```

## Step 2: Build Container Images

### Backend Dockerfile (backend/Dockerfile)

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN python -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# Runtime stage
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 curl && rm -rf /var/lib/apt/lists/*
RUN useradd -m -u 1000 appuser
COPY --from=builder /opt/venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH
COPY app/ ./app/
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (frontend/Dockerfile)

**Important**: Use `node:18-slim` (NOT Alpine) to avoid segfault issues with Next.js standalone.

```dockerfile
# Build stage
FROM node:18-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runtime stage
FROM node:18-slim
WORKDIR /app
RUN apt-get update && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 -g nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME="0.0.0.0"
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
```

### Build and Load Images

```bash
# Build images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Verify images
docker images | grep todo

# Load into Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# Verify loaded
minikube image ls | grep todo
```

## Step 3: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace todo-chatbot

# Create backend secrets (replace with your values)
kubectl create secret generic backend-secret \
  --namespace todo-chatbot \
  --from-literal=DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=GROQ_API_KEY="your-groq-api-key"

# Create frontend secrets
kubectl create secret generic frontend-secret \
  --namespace todo-chatbot \
  --from-literal=BETTER_AUTH_SECRET="your-auth-secret" \
  --from-literal=DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## Step 4: Deploy with Helm

```bash
# Lint charts first
helm lint helm/backend
helm lint helm/frontend

# Deploy backend
helm upgrade --install backend helm/backend -n todo-chatbot

# Wait for backend
kubectl wait --for=condition=Ready pods -l app=backend -n todo-chatbot --timeout=180s

# Deploy frontend
helm upgrade --install frontend helm/frontend -n todo-chatbot

# Wait for frontend
kubectl wait --for=condition=Ready pods -l app=frontend -n todo-chatbot --timeout=180s

# Verify all pods running
kubectl get pods -n todo-chatbot
```

Expected output:
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxx-xxxxx         1/1     Running   0          1m
backend-xxxxx-xxxxx         1/1     Running   0          1m
frontend-xxxxx-xxxxx        1/1     Running   0          1m
frontend-xxxxx-xxxxx        1/1     Running   0          1m
```

## Step 5: Access Application

### Via Port-Forward (Recommended for local dev)

```bash
# Terminal 1: Port-forward backend
kubectl port-forward -n todo-chatbot svc/backend 8000:8000

# Terminal 2: Port-forward frontend
kubectl port-forward -n todo-chatbot svc/frontend 3000:3000

# Access at http://localhost:3000
```

### Via NodePort

```bash
# Get Minikube IP
minikube ip

# Frontend is exposed on NodePort 30000
# Access at http://<minikube-ip>:30000
```

## Step 6: Verify Functionality

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health
# Expected: {"status":"healthy","timestamp":"..."}

# Frontend
curl -I http://localhost:3000
# Expected: HTTP 200 OK
```

### End-to-End Test

1. Open browser to `http://localhost:3000`
2. Navigate to `/login` page
3. Sign in or create an account
4. Access chat interface
5. Send: "Add a task to test kubernetes deployment"
6. Verify task is created
7. Send: "Show my tasks"
8. Verify task is listed

### Pod Self-Healing Test

```bash
# Delete a pod
kubectl delete pod -n todo-chatbot -l app=backend --wait=false

# Watch pods recreate (should happen within 60 seconds)
kubectl get pods -n todo-chatbot -w
```

## Troubleshooting

### Backend Permission Error (Errno 13)

If backend pod fails with permission error running uvicorn:
- **Cause**: pip --user install doesn't work with non-root user
- **Fix**: Use virtual environment at `/opt/venv` as shown in Dockerfile above

### Frontend Exit Code 139 (Segfault)

If frontend pod exits with code 139:
- **Cause**: Alpine base image incompatibility with Next.js standalone
- **Fix**: Use `node:18-slim` instead of `node:18-alpine`

### Image Not Updating After Rebuild

If Minikube uses cached image after rebuild:
- **Fix**: Tag with new version: `docker build -t todo-frontend:v2 ./frontend`
- Then: `minikube image load todo-frontend:v2`
- Update Helm: `helm upgrade frontend helm/frontend -n todo-chatbot --set image.tag=v2`

### "Failed to Fetch" in Chat

If chat shows "failed to fetch":
- **Cause**: User not logged in (JWT token required)
- **Fix**: Navigate to `/login` and sign in first

### Port-Forward Dies

If port-forward connection drops:
```bash
# Restart port-forwards
kubectl port-forward -n todo-chatbot svc/backend 8000:8000 &
kubectl port-forward -n todo-chatbot svc/frontend 3000:3000 &
```

## Cleanup

```bash
# Uninstall Helm releases
helm uninstall frontend -n todo-chatbot
helm uninstall backend -n todo-chatbot

# Delete secrets
kubectl delete secret backend-secret frontend-secret -n todo-chatbot

# Delete namespace
kubectl delete namespace todo-chatbot

# Stop Minikube
minikube stop

# Delete cluster (if needed)
minikube delete
```

## Deployment Summary

| Component | Image | Replicas | Service Type | Port |
|-----------|-------|----------|--------------|------|
| Backend | todo-backend:latest | 2 | ClusterIP | 8000 |
| Frontend | todo-frontend:latest | 2 | NodePort | 3000 (30000) |

| Resource | Backend | Frontend |
|----------|---------|----------|
| CPU Request | 100m | 200m |
| CPU Limit | 500m | 1000m |
| Memory Request | 256Mi | 512Mi |
| Memory Limit | 512Mi | 1024Mi |
