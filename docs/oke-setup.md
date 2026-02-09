# Oracle OKE Setup Guide

## Prerequisites

- Oracle Cloud Infrastructure (OCI) account
- OCI CLI installed and configured
- kubectl installed
- Helm 3.x installed

## Secrets Configuration

### GitHub Actions Secrets

Configure the following secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `OCI_CLI_USER` | OCI user OCID |
| `OCI_CLI_TENANCY` | OCI tenancy OCID |
| `OCI_CLI_FINGERPRINT` | API key fingerprint |
| `OCI_CLI_KEY_CONTENT` | Private key content (PEM format) |
| `OCI_CLI_REGION` | OCI region (e.g., `us-ashburn-1`) |
| `OKE_CLUSTER_OCID` | OKE cluster OCID |

### Kubernetes Secrets

Create the following secrets in the `todo-chatbot` namespace:

```bash
# PostgreSQL connection
kubectl create secret generic postgres-secret \
    --namespace todo-chatbot \
    --from-literal=database-url="postgresql://user:pass@host:5432/todo_db" \
    --from-literal=audit-database-url="postgresql://user:pass@host:5432/audit_db"

# JWT secret
kubectl create secret generic jwt-secret \
    --namespace todo-chatbot \
    --from-literal=secret="your-production-jwt-secret"

# GitHub Container Registry
kubectl create secret docker-registry ghcr-secret \
    --namespace todo-chatbot \
    --docker-server=ghcr.io \
    --docker-username=$GITHUB_USER \
    --docker-password=$GITHUB_TOKEN
```

## Database Setup

### Option 1: OCI Autonomous Database (Recommended)

1. Create an Autonomous Database in OCI Console
2. Download wallet and configure connection string
3. Update `postgres-secret` with ATP connection string

### Option 2: PostgreSQL in Kubernetes

```bash
helm install postgres bitnami/postgresql \
    --namespace todo-chatbot \
    --set auth.postgresPassword=your-password \
    --set auth.database=todo_db \
    --set primary.persistence.size=10Gi \
    --set primary.persistence.storageClass=oci-bv
```

## Kafka Setup (Strimzi)

1. Install Strimzi operator:
```bash
kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka
```

2. Deploy Kafka cluster:
```bash
kubectl apply -f helm/kafka/values-oke.yaml -n kafka
```

3. Wait for cluster to be ready:
```bash
kubectl wait kafka/todo-chatbot-kafka --for=condition=Ready --timeout=300s -n kafka
```

## Dapr Installation

```bash
dapr init -k --wait
```

## Deployment

```bash
# Manual deployment
./scripts/deploy-local.sh

# Or via GitHub Actions (automatic on push to main)
```

## Verification

```bash
# Check pods
kubectl get pods -n todo-chatbot

# Check services
kubectl get svc -n todo-chatbot

# Check Dapr components
kubectl get components -n todo-chatbot

# View logs
kubectl logs -f -l app.kubernetes.io/name=chat-api -n todo-chatbot
```

## Troubleshooting

### Pods not starting

1. Check events: `kubectl describe pod <pod-name> -n todo-chatbot`
2. Check logs: `kubectl logs <pod-name> -n todo-chatbot`
3. Verify secrets exist: `kubectl get secrets -n todo-chatbot`

### Dapr sidecar issues

1. Verify Dapr is installed: `dapr status -k`
2. Check Dapr logs: `kubectl logs <pod-name> -c daprd -n todo-chatbot`
3. Verify components: `kubectl get components -n todo-chatbot`

### Kafka connectivity

1. Check Kafka pods: `kubectl get pods -n kafka`
2. Test connectivity: `kubectl exec -it <chat-api-pod> -n todo-chatbot -- curl localhost:3500/v1.0/healthz`
