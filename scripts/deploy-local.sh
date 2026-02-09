#!/bin/bash
# Local Deployment Script for Todo Chatbot
# US6: Deploys all services to Minikube

set -e

echo "=== Todo Chatbot Local Deployment ==="

NAMESPACE=${NAMESPACE:-todo-chatbot}
HELM_RELEASE=${HELM_RELEASE:-todo-chatbot}

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed."; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "helm is required but not installed."; exit 1; }

# Ensure namespace exists
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Deploy Dapr components
echo "Deploying Dapr components..."
helm upgrade --install dapr-components ./helm/dapr-components \
    --namespace $NAMESPACE \
    --wait

# Build dependencies for umbrella chart
echo "Building Helm dependencies..."
cd helm/todo-chatbot
helm dependency build
cd ../..

# Deploy application
echo "Deploying Todo Chatbot application..."
helm upgrade --install $HELM_RELEASE ./helm/todo-chatbot \
    --namespace $NAMESPACE \
    --wait \
    --timeout 10m

# Wait for pods to be ready
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/instance=$HELM_RELEASE \
    --namespace $NAMESPACE \
    --timeout=300s || echo "Some pods may still be starting..."

# Show status
echo ""
echo "=== Deployment Status ==="
kubectl get pods -n $NAMESPACE
echo ""
kubectl get svc -n $NAMESPACE

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "To access the chat-api locally:"
echo "  kubectl port-forward svc/todo-chatbot-chat-api 8000:8000 -n $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -f -l app.kubernetes.io/name=chat-api -n $NAMESPACE"
echo ""
echo "To run validation:"
echo "  ./scripts/validate-local.sh"
