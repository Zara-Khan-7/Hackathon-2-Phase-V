#!/bin/bash
# Minikube Setup Script for Todo Chatbot
# US6: Sets up local Kubernetes environment with Dapr and Kafka

set -e

echo "=== Todo Chatbot Minikube Setup ==="

# Check prerequisites
command -v minikube >/dev/null 2>&1 || { echo "minikube is required but not installed."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed."; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "helm is required but not installed."; exit 1; }

# Start Minikube if not running
if ! minikube status | grep -q "Running"; then
    echo "Starting Minikube..."
    minikube start --cpus=4 --memory=8192 --driver=docker
fi

# Enable required addons
echo "Enabling Minikube addons..."
minikube addons enable ingress
minikube addons enable metrics-server

# Install Dapr
echo "Installing Dapr..."
if ! dapr status -k 2>/dev/null | grep -q "dapr-operator"; then
    dapr init -k --wait
else
    echo "Dapr already installed"
fi

# Create namespaces
echo "Creating namespaces..."
kubectl create namespace kafka --dry-run=client -o yaml | kubectl apply -f -
kubectl create namespace todo-chatbot --dry-run=client -o yaml | kubectl apply -f -

# Install Redis (for Dapr state store)
echo "Installing Redis..."
helm repo add bitnami https://charts.bitnami.com/bitnami || true
helm upgrade --install redis bitnami/redis \
    --namespace default \
    --set auth.enabled=false \
    --set architecture=standalone \
    --wait

# Install Redpanda (Kafka)
echo "Installing Redpanda (Kafka)..."
helm repo add redpanda https://charts.redpanda.com || true
helm upgrade --install redpanda redpanda/redpanda \
    --namespace kafka \
    -f helm/kafka/values-minikube.yaml \
    --wait || echo "Redpanda installation may need additional configuration"

# Install PostgreSQL
echo "Installing PostgreSQL..."
helm upgrade --install postgres bitnami/postgresql \
    --namespace default \
    --set auth.postgresPassword=postgres \
    --set auth.database=todo_db \
    --wait

# Create secrets
echo "Creating secrets..."
kubectl create secret generic postgres-secret \
    --namespace todo-chatbot \
    --from-literal=database-url="postgresql://postgres:postgres@postgres-postgresql.default.svc.cluster.local:5432/todo_db" \
    --from-literal=audit-database-url="postgresql://postgres:postgres@postgres-postgresql.default.svc.cluster.local:5432/audit_db" \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic jwt-secret \
    --namespace todo-chatbot \
    --from-literal=secret="your-jwt-secret-key-change-in-production" \
    --dry-run=client -o yaml | kubectl apply -f -

echo "=== Minikube Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Build Docker images: ./scripts/build-images.sh"
echo "2. Deploy application: ./scripts/deploy-local.sh"
echo "3. Access dashboard: minikube dashboard"
