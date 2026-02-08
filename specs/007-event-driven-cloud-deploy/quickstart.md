# Quickstart: Event-Driven Cloud Deployment

**Feature**: 007-event-driven-cloud-deploy
**Date**: 2026-02-09

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| Docker Desktop | 4.x+ | [docker.com](https://docker.com) |
| Minikube | 1.32+ | `winget install minikube` |
| kubectl | 1.28+ | `winget install kubectl` |
| Helm | 3.12+ | `winget install Helm.Helm` |
| Dapr CLI | 1.12+ | [dapr.io](https://docs.dapr.io/getting-started/install-dapr-cli/) |
| Python | 3.11+ | Already installed |

### Verify Installations

```bash
# Check all tools
docker --version
minikube version
kubectl version --client
helm version
dapr --version
python --version
```

## Part A: Local Development Setup

### 1. Start Minikube

```bash
# Start with adequate resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server
```

### 2. Install Dapr

```bash
# Initialize Dapr in Kubernetes mode
dapr init -k

# Verify Dapr installation
dapr status -k
kubectl get pods -n dapr-system
```

### 3. Deploy Redpanda (Kafka Alternative)

```bash
# Add Redpanda Helm repo
helm repo add redpanda https://charts.redpanda.com
helm repo update

# Install Redpanda (lightweight, no JVM)
helm install redpanda redpanda/redpanda \
  --namespace kafka \
  --create-namespace \
  --set statefulset.replicas=1 \
  --set resources.cpu.cores=0.5 \
  --set resources.memory.container.max=1Gi
```

### 4. Deploy Redis

```bash
# Deploy Redis for state store
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis \
  --namespace todo-app \
  --create-namespace \
  --set auth.enabled=false \
  --set architecture=standalone
```

### 5. Apply Dapr Components

```bash
# Create namespace
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Apply Dapr components from contracts
kubectl apply -f specs/007-event-driven-cloud-deploy/contracts/dapr-components.yaml
```

## Part B: Build and Deploy Services

### 1. Build Docker Images

```bash
# Set Minikube Docker environment
eval $(minikube docker-env)

# Build Chat API (enhanced)
docker build -t chat-api:latest services/chat-api/

# Build Notification Service
docker build -t notification-service:latest services/notification-service/

# Build Recurring Task Service
docker build -t recurring-task-service:latest services/recurring-task-service/

# Build Audit Service
docker build -t audit-service:latest services/audit-service/
```

### 2. Deploy with Helm

```bash
# Create secrets
kubectl create secret generic backend-secret \
  --namespace todo-app \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=GROQ_API_KEY="$GROQ_API_KEY"

# Deploy umbrella chart
helm upgrade --install todo-chatbot ./helm/todo-chatbot \
  --namespace todo-app \
  --set global.image.pullPolicy=Never
```

### 3. Verify Deployment

```bash
# Check all pods are running with Dapr sidecars
kubectl get pods -n todo-app

# Check Dapr components
dapr components -k -n todo-app

# View Chat API logs
kubectl logs -l app=chat-api -n todo-app -c chat-api -f
```

## Part C: Validate Event Flow

### 1. Port Forward Services

```bash
# Terminal 1: Chat API
kubectl port-forward svc/chat-api 8000:8000 -n todo-app

# Terminal 2: View Kafka topics
kubectl exec -it redpanda-0 -n kafka -- rpk topic list
```

### 2. Create Task and Verify Events

```bash
# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event Publishing",
    "description": "Verify event flow",
    "due_date": "2026-02-10T10:00:00Z",
    "reminder_offset_minutes": 30
  }'

# Check task-events topic
kubectl exec -it redpanda-0 -n kafka -- \
  rpk topic consume task-events --num 1

# Check reminders topic
kubectl exec -it redpanda-0 -n kafka -- \
  rpk topic consume reminders --num 1
```

### 3. Verify Consumer Processing

```bash
# Check Notification Service logs
kubectl logs -l app=notification-service -n todo-app -c notification-service

# Check Audit Service logs
kubectl logs -l app=audit-service -n todo-app -c audit-service

# Query audit log
curl http://localhost:8000/api/v1/audit-log?limit=10 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## Part D: Cloud Deployment (Oracle OKE)

### 1. Prerequisites

- Oracle Cloud account with Always Free tier
- OKE cluster provisioned (4 OCPUs, 24GB RAM)
- Docker Hub account for image registry
- GitHub repository with secrets configured

### 2. Configure CI/CD Secrets

In GitHub repository settings, add these secrets:

| Secret | Description |
|--------|-------------|
| `OKE_KUBECONFIG` | Base64-encoded kubeconfig for OKE |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `GROQ_API_KEY` | Groq API key |

### 3. Push to Main Branch

```bash
# Merge feature branch to main
git checkout main
git merge 007-event-driven-cloud-deploy

# Push triggers CI/CD
git push origin main
```

### 4. Monitor Deployment

```bash
# View GitHub Actions workflow
# Go to: https://github.com/<repo>/actions

# Connect to OKE cluster
export KUBECONFIG=/path/to/oke-kubeconfig

# Verify deployment
kubectl get pods -n todo-app
kubectl get ingress -n todo-app
```

## Part E: Monitoring Setup

### 1. Deploy Prometheus Stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --create-namespace \
  --set prometheus.prometheusSpec.resources.requests.memory=256Mi \
  --set grafana.resources.requests.memory=128Mi
```

### 2. Access Dashboards

```bash
# Port forward Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n observability

# Login: admin / prom-operator
# Import Dapr dashboard: https://grafana.com/grafana/dashboards/11677
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Pods stuck in Pending | Check resource limits: `kubectl describe pod <name>` |
| Dapr sidecar not injecting | Verify annotation: `dapr.io/enabled: "true"` |
| Events not publishing | Check Dapr logs: `kubectl logs <pod> -c daprd` |
| Consumer not receiving | Verify subscription: `dapr components -k` |

### Useful Commands

```bash
# Restart all pods
kubectl rollout restart deployment -n todo-app

# View Dapr sidecar logs
kubectl logs <pod-name> -c daprd -n todo-app

# Test Pub/Sub directly
dapr publish --pubsub pubsub --topic task-events --data '{"test":"data"}'

# Check component status
dapr components -k -n todo-app
```

## Success Criteria Checklist

- [ ] All 4 services running with Dapr sidecars
- [ ] Events published to Kafka topics within 100ms
- [ ] Consumers processing events within 1s
- [ ] Reminder jobs scheduling and firing correctly
- [ ] Audit log capturing all events
- [ ] Monitoring dashboards showing metrics
- [ ] CI/CD pipeline deploying to OKE
