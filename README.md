# Phase V: Event-Driven Cloud Deployment

A modern, AI-powered task management chatbot with event-driven microservices architecture, deployed to Kubernetes using Dapr, Kafka, and Helm.

## Deployment Status

| Environment | Status | Platform |
|-------------|--------|----------|
| Local (Minikube) | Verified | Docker + Minikube + Dapr |
| Cloud (OKE) | Ready for Deploy | Oracle Kubernetes Engine |

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | https://frontend-sepia-alpha-94.vercel.app |
| Backend API | https://zaraa7-phase5.hf.space |
| API Docs | https://zaraa7-phase5.hf.space/docs |

## What's New in Phase V

Phase V transforms the monolithic backend into an **event-driven microservices architecture**:

- **Dapr Building Blocks** - Pub/Sub, State Management, Secrets, Jobs API
- **Kafka/Redpanda** - Event streaming for task operations
- **4 Microservices** - chat-api, notification, recurring-task, audit
- **Helm Charts** - Production-ready Kubernetes deployments
- **CI/CD Pipelines** - GitHub Actions for OKE deployment
- **Observability** - Prometheus, Grafana dashboards

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Kubernetes Cluster (Minikube/OKE)                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        todo-chatbot namespace                          │  │
│  │                                                                        │  │
│  │  ┌─────────────┐     Dapr Pub/Sub      ┌─────────────────────────┐   │  │
│  │  │  chat-api   │ ──────────────────────▶│    Kafka (Redpanda)     │   │  │
│  │  │  (FastAPI)  │       task-events      │                         │   │  │
│  │  │   + Dapr    │       reminders        │  Topics:                │   │  │
│  │  └─────────────┘                        │  - task-events          │   │  │
│  │         │                               │  - reminders            │   │  │
│  │         │ task.created                  │  - task-updates         │   │  │
│  │         │ task.updated                  └────────────┬────────────┘   │  │
│  │         │ task.completed                             │                │  │
│  │         │ task.deleted                               │                │  │
│  │         ▼                                            ▼                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Consumer Services                              │  │  │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │  │  │
│  │  │  │notification │  │ recurring-  │  │   audit     │              │  │  │
│  │  │  │  service    │  │   task      │  │  service    │              │  │  │
│  │  │  │             │  │  service    │  │             │              │  │  │
│  │  │  │ reminders   │  │ task.comp.  │  │ task-events │              │  │  │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐               │  │
│  │  │   Redis     │    │ PostgreSQL  │    │  Dapr       │               │  │
│  │  │ (State)     │    │ (Data)      │    │  Sidecars   │               │  │
│  │  └─────────────┘    └─────────────┘    └─────────────┘               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
Phase V/
├── services/                    # Microservices
│   ├── chat-api/                # Main API (FastAPI + Dapr)
│   │   ├── app/
│   │   │   ├── dapr/            # Dapr client & idempotency
│   │   │   ├── routers/         # API endpoints
│   │   │   ├── services/        # Event publishing
│   │   │   └── schemas/         # Event schemas
│   │   └── Dockerfile
│   ├── notification-service/    # Reminder consumer
│   ├── recurring-task-service/  # Recurring task handler
│   └── audit-service/           # Event audit logging
│
├── dapr/                        # Dapr configuration
│   ├── components/              # Pub/Sub, State, Secrets
│   └── config/                  # Runtime configuration
│
├── helm/                        # Kubernetes deployments
│   ├── todo-chatbot/            # Umbrella chart
│   │   ├── charts/              # Service subcharts
│   │   ├── values.yaml          # Local config
│   │   └── values-oke.yaml      # OKE production config
│   ├── dapr-components/         # Dapr components chart
│   ├── kafka/                   # Kafka values
│   └── monitoring/              # Prometheus/Grafana
│
├── .github/workflows/           # CI/CD pipelines
│   ├── ci.yaml                  # Build & test
│   └── cd-oke.yaml              # Deploy to OKE
│
├── scripts/                     # Deployment scripts
│   ├── setup-minikube.sh        # Local cluster setup
│   ├── deploy-local.sh          # Deploy to Minikube
│   ├── validate-local.sh        # E2E validation
│   └── setup-monitoring.sh      # Prometheus/Grafana
│
├── docs/                        # Documentation
│   ├── oke-setup.md             # OKE secrets & config
│   └── oke-provisioning.md      # Cluster provisioning
│
└── specs/007-event-driven-cloud-deploy/
    ├── spec.md                  # Requirements
    ├── plan.md                  # Architecture
    ├── tasks.md                 # 103 implementation tasks
    └── data-model.md            # Event schemas
```

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24.x+ | Container runtime |
| Minikube | 1.32+ | Local Kubernetes |
| kubectl | 1.28+ | Kubernetes CLI |
| Helm | 3.13+ | K8s package manager |
| Dapr CLI | 1.12+ | Dapr installation |

### Local Deployment (Minikube)

#### Linux/macOS

```bash
# 1. Setup Minikube with Dapr and Kafka
./scripts/setup-minikube.sh

# 2. Build Docker images
docker build -t todo-chatbot/chat-api:latest ./services/chat-api
docker build -t todo-chatbot/notification-service:latest ./services/notification-service
docker build -t todo-chatbot/recurring-task-service:latest ./services/recurring-task-service
docker build -t todo-chatbot/audit-service:latest ./services/audit-service

# Load images into Minikube
minikube image load todo-chatbot/chat-api:latest
minikube image load todo-chatbot/notification-service:latest
minikube image load todo-chatbot/recurring-task-service:latest
minikube image load todo-chatbot/audit-service:latest

# 3. Deploy application
./scripts/deploy-local.sh

# 4. Access the API
kubectl port-forward svc/todo-chatbot-chat-api 8000:8000 -n todo-chatbot
open http://localhost:8000/docs

# 5. Validate deployment
./scripts/validate-local.sh
```

#### Windows (PowerShell)

```powershell
# 1. Start Minikube (adjust memory based on your system)
minikube start --driver=docker --cpus=2 --memory=3072

# 2. Install Dapr on Kubernetes
dapr init -k --wait

# 3. Create namespace and install infrastructure
kubectl create namespace todo-chatbot
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis --namespace todo-chatbot --set auth.enabled=false
helm install postgresql bitnami/postgresql --namespace todo-chatbot --set auth.postgresPassword=postgres

# 4. Build images using Minikube's Docker daemon
minikube docker-env --shell=powershell | Invoke-Expression
docker build -t todo-chatbot/chat-api:latest ./services/chat-api
docker build -t todo-chatbot/notification-service:latest ./services/notification-service
docker build -t todo-chatbot/recurring-task-service:latest ./services/recurring-task-service
docker build -t todo-chatbot/audit-service:latest ./services/audit-service

# 5. Apply Dapr components and deploy
kubectl apply -f dapr/components/pubsub-redis.yaml
kubectl apply -f dapr/components/statestore-local.yaml
helm install todo-chatbot ./helm/todo-chatbot --namespace todo-chatbot

# 6. Access the API
kubectl port-forward svc/todo-chatbot-chat-api 8000:8000 -n todo-chatbot
# Open http://localhost:8000/docs
```

### Monitoring Setup

```bash
# Install Prometheus and Grafana
./scripts/setup-monitoring.sh

# Access Grafana dashboard
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
open http://localhost:3000  # admin/admin
```

## Event-Driven Features

### Task Events (Kafka Topics)

| Topic | Events | Publisher | Consumers |
|-------|--------|-----------|-----------|
| `task-events` | created, updated, completed, deleted | chat-api | audit, recurring-task |
| `reminders` | scheduled, triggered | chat-api | notification |
| `task-updates` | sync | chat-api | WebSocket (future) |

### Event Schema (CloudEvents)

```json
{
  "event_id": "uuid",
  "event_type": "task.created",
  "timestamp": "2026-02-09T12:00:00Z",
  "user_id": "user-123",
  "source": "chat-api",
  "specversion": "1.0",
  "payload": {
    "id": "task-uuid",
    "title": "Buy groceries",
    "status": "pending",
    "priority": "medium",
    "due_date": "2026-02-10T18:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "weekly"
  }
}
```

## Dapr Building Blocks

| Block | Component | Purpose |
|-------|-----------|---------|
| Pub/Sub | Kafka/Redpanda (prod) or Redis (local) | Event messaging |
| State | Redis | Idempotency tracking |
| Secrets | Kubernetes | Credential management |
| Jobs | Dapr Scheduler | Reminder scheduling |
| Service Invocation | Dapr | Cross-service calls |

> **Note:** For local development with limited resources, Redis Pub/Sub can be used instead of Kafka. The `dapr/components/pubsub-redis.yaml` component is provided for this purpose.

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI (ci.yaml)**: Lint → Test → Build → Push to GHCR
2. **CD (cd-oke.yaml)**: Deploy to Oracle OKE on push to main

### Required Secrets

| Secret | Description |
|--------|-------------|
| `OCI_CLI_USER` | OCI user OCID |
| `OCI_CLI_TENANCY` | OCI tenancy OCID |
| `OCI_CLI_FINGERPRINT` | API key fingerprint |
| `OCI_CLI_KEY_CONTENT` | Private key (PEM) |
| `OKE_CLUSTER_OCID` | OKE cluster OCID |

## Resource Allocation (OKE Always Free)

| Component | OCPUs | Memory | Replicas |
|-----------|-------|--------|----------|
| chat-api | 0.5 | 1 GB | 2 |
| notification | 0.25 | 512 MB | 1 |
| recurring-task | 0.25 | 512 MB | 1 |
| audit | 0.25 | 512 MB | 1 |
| PostgreSQL | 0.5 | 2 GB | 1 |
| Redis | 0.25 | 512 MB | 1 |
| Kafka | 0.5 | 2 GB | 1 |
| **Total** | **2.5** | **7.5 GB** | - |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15+ (Vercel) |
| API Gateway | FastAPI + Dapr |
| Messaging | Kafka (Redpanda/Strimzi) |
| State Store | Redis |
| Database | PostgreSQL (Neon) |
| Container | Docker |
| Orchestration | Kubernetes (Minikube/OKE) |
| Service Mesh | Dapr |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

## Project Evolution

| Phase | Description | Key Features |
|-------|-------------|--------------|
| I | Console App | Python CLI, JSON storage |
| II | Full-Stack | Next.js, FastAPI, PostgreSQL |
| III | AI Chatbot | Groq LLM, MCP Tools |
| IV | K8s Deploy | Docker, Helm, Minikube |
| **V** | **Event-Driven** | **Dapr, Kafka, OKE, CI/CD** |

## Author

**Rabeeka** - Hackathon 2

## License

MIT License
