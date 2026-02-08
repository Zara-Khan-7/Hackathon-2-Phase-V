# Phase IV: Kubernetes Deployment of AI-Native Todo Chatbot

A modern, AI-powered task management chatbot deployed to Kubernetes using Helm charts, Docker containers, and AI-assisted DevOps operations.

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | https://frontend-murex-eta-83.vercel.app |
| Backend API | https://rabeeka10-todo-api-backend.hf.space |
| API Docs | https://rabeeka10-todo-api-backend.hf.space/docs |

## What's New in Phase IV

Phase IV containerizes and deploys the Phase III AI Chatbot to a **local Kubernetes cluster**:

- **Docker Containers** - Multi-stage builds for optimized images
- **Helm Charts** - Templated Kubernetes deployments
- **Minikube Cluster** - Local Kubernetes environment
- **Health Probes** - Liveness and readiness checks
- **Self-Healing** - Automatic pod recovery
- **AI-Assisted Operations** - kubectl-ai for cluster management

## Phase IV Requirements

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker Desktop | 4.x+ | Container runtime |
| Minikube | 1.30+ | Local Kubernetes cluster |
| kubectl | 1.28+ | Kubernetes CLI |
| Helm | 3.x+ | Package manager for K8s |
| kubectl-ai | Latest | AI-assisted kubectl |

### Installation

```bash
# Install Minikube
winget install Kubernetes.minikube

# Install Helm
winget install Helm.Helm

# Install kubectl-ai
# See: https://github.com/sozercan/kubectl-ai
```

## Quick Start - Kubernetes Deployment

### 1. Start Minikube Cluster

```bash
# Start cluster with Docker driver
minikube start --driver=docker --cpus=2 --memory=3500

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Create namespace
kubectl create namespace todo-chatbot
```

### 2. Build and Load Docker Images

```bash
# Build images
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Load into Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### 3. Create Kubernetes Secrets

```bash
# Backend secrets
kubectl create secret generic backend-secret \
  --from-literal=DATABASE_URL="your-neon-url" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=GROQ_API_KEY="your-groq-key" \
  -n todo-chatbot

# Frontend secrets
kubectl create secret generic frontend-secret \
  --from-literal=DATABASE_URL="your-neon-url" \
  --from-literal=BETTER_AUTH_SECRET="your-auth-secret" \
  -n todo-chatbot
```

### 4. Deploy with Helm

```bash
# Deploy backend
helm upgrade --install backend helm/backend -n todo-chatbot

# Deploy frontend
helm upgrade --install frontend helm/frontend -n todo-chatbot

# Verify pods are running
kubectl get pods -n todo-chatbot
```

### 5. Access the Application

```bash
# Port-forward frontend
kubectl port-forward -n todo-chatbot svc/frontend 3000:3000

# Port-forward backend (optional)
kubectl port-forward -n todo-chatbot svc/backend 8000:8000

# Open browser
open http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Minikube Cluster                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    todo-chatbot namespace                      │  │
│  │                                                                │  │
│  │  ┌─────────────────┐          ┌─────────────────┐             │  │
│  │  │   Frontend      │          │   Backend       │             │  │
│  │  │   Deployment    │          │   Deployment    │             │  │
│  │  │  ┌───────────┐  │          │  ┌───────────┐  │             │  │
│  │  │  │  Pod 1    │  │          │  │  Pod 1    │  │             │  │
│  │  │  │ Next.js   │  │   ────▶  │  │ FastAPI   │  │ ────▶ Neon  │  │
│  │  │  └───────────┘  │          │  │ + AI Agent│  │       PG    │  │
│  │  │  ┌───────────┐  │          │  └───────────┘  │             │  │
│  │  │  │  Pod 2    │  │          │  ┌───────────┐  │             │  │
│  │  │  │ (replica) │  │          │  │  Pod 2    │  │             │  │
│  │  │  └───────────┘  │          │  │ (replica) │  │             │  │
│  │  └────────┬────────┘          └────────┬────────┘             │  │
│  │           │                            │                       │  │
│  │  ┌────────▼────────┐          ┌────────▼────────┐             │  │
│  │  │   Service       │          │   Service       │             │  │
│  │  │  NodePort:30000 │          │  ClusterIP:8000 │             │  │
│  │  └─────────────────┘          └─────────────────┘             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    kubectl port-forward
                              │
                              ▼
                    http://localhost:3000
```

## Project Structure

```
Phase IV/
├── backend/                     # Python FastAPI Backend
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── app/
│   │   ├── agent/               # AI Agent (Groq/LLM)
│   │   ├── mcp/                 # MCP Tools
│   │   ├── models/              # SQLModel models
│   │   └── routers/
│   └── requirements.txt
│
├── frontend/                    # Next.js Frontend
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── .dockerignore
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login/Signup
│   │   │   └── (protected)/
│   │   │       ├── dashboard/   # Task dashboard
│   │   │       └── chat/        # AI Chat interface
│   │   └── components/
│   └── package.json
│
├── helm/                        # Helm Charts
│   ├── backend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── configmap.yaml
│   │       └── _helpers.tpl
│   └── frontend/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── configmap.yaml
│           └── _helpers.tpl
│
├── specs/                       # Feature specifications
│   └── 005-k8s-deployment/
│       ├── spec.md              # Requirements
│       ├── plan.md              # Architecture decisions
│       ├── tasks.md             # Implementation tasks
│       └── quickstart.md        # Deployment guide
│
└── history/prompts/             # Prompt History Records
    └── 005-k8s-deployment/
```

## Helm Chart Configuration

### Backend values.yaml

```yaml
replicaCount: 2

image:
  repository: todo-backend
  tag: latest
  pullPolicy: Never  # Use local images

service:
  type: ClusterIP
  port: 8000

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi

livenessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  periodSeconds: 10
```

### Frontend values.yaml

```yaml
replicaCount: 2

image:
  repository: todo-frontend
  tag: latest
  pullPolicy: Never

service:
  type: NodePort
  port: 3000
  nodePort: 30000

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi
```

## Docker Images

### Backend Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Kubernetes Operations

### Check Deployment Status

```bash
# View all resources
kubectl get all -n todo-chatbot

# Check pod logs
kubectl logs -l app=backend -n todo-chatbot
kubectl logs -l app=frontend -n todo-chatbot

# Describe deployment
kubectl describe deployment backend -n todo-chatbot
```

### Scaling

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n todo-chatbot

# Or via Helm
helm upgrade backend helm/backend --set replicaCount=3 -n todo-chatbot
```

### Troubleshooting

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-chatbot

# Execute into pod
kubectl exec -it <pod-name> -n todo-chatbot -- /bin/sh

# Check service endpoints
kubectl get endpoints -n todo-chatbot
```

## Health Checks

| Service | Endpoint | Probe Type |
|---------|----------|------------|
| Backend | `/health` | HTTP GET |
| Frontend | `/` | HTTP GET |

### Health Response

```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T12:00:00Z"
}
```

## Features Summary

### Core Features (Phase II)
- User Authentication with Better Auth
- Task CRUD operations
- Task filtering by status and priority
- Responsive design

### AI Chatbot Features (Phase III)
- Natural Language Task Management
- Conversational Interface with animations
- AI-Powered Intent Detection
- 5 MCP Tools (add, list, complete, update, delete)
- Conversation Persistence

### Kubernetes Features (Phase IV)
- Multi-stage Docker builds
- Helm chart templating
- Health probes (liveness/readiness)
- Resource limits and requests
- Pod replication (2 replicas each)
- Self-healing (automatic pod restart)
- ConfigMaps for environment variables
- Secrets for sensitive data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+ (App Router) |
| Backend | Python FastAPI |
| AI/LLM | Groq API (Llama 3.3 70B) |
| Database | Neon Serverless PostgreSQL |
| Container | Docker (multi-stage builds) |
| Orchestration | Kubernetes (Minikube) |
| Package Manager | Helm 3 |
| AI DevOps | kubectl-ai |

## Environment Variables

### Backend

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection | Secret |
| `JWT_SECRET` | JWT signing secret | Secret |
| `GROQ_API_KEY` | Groq API key | Secret |
| `CORS_ORIGINS` | Allowed origins | ConfigMap |

### Frontend

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection | Secret |
| `BETTER_AUTH_SECRET` | Auth secret | Secret |
| `NEXT_PUBLIC_API_URL` | Backend API URL | ConfigMap |

## Development Workflow

This project uses **Spec-Driven Development (SDD)**:

1. **Specify** - Define requirements in spec.md
2. **Plan** - Create architecture in plan.md
3. **Tasks** - Break down into tasks.md
4. **Implement** - Execute with Claude Code
5. **PHR** - Record prompts in history/prompts/

## Project Evolution

| Phase | Description | Key Features |
|-------|-------------|--------------|
| Phase I | Console Todo App | Python CLI, JSON storage |
| Phase II | Full-Stack Web App | Next.js, FastAPI, PostgreSQL |
| Phase III | AI-Native Chatbot | Groq LLM, MCP Tools, Chat UI |
| **Phase IV** | **Kubernetes Deployment** | **Docker, Helm, Minikube** |

## Author

**Rabeeka** - Hackathon 2

## License

MIT License

---

## Quick Reference

```bash
# Start everything
minikube start --driver=docker --cpus=2 --memory=3500
helm upgrade --install backend helm/backend -n todo-chatbot
helm upgrade --install frontend helm/frontend -n todo-chatbot
kubectl port-forward -n todo-chatbot svc/frontend 3000:3000

# Stop everything
minikube stop

# Clean up
helm uninstall backend -n todo-chatbot
helm uninstall frontend -n todo-chatbot
kubectl delete namespace todo-chatbot
minikube delete
```
