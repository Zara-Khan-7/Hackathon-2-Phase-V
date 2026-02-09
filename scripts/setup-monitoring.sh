#!/bin/bash
# Monitoring Setup Script for Todo Chatbot
# US8: Deploys Prometheus and Grafana

set -e

echo "=== Todo Chatbot Monitoring Setup ==="

NAMESPACE=${NAMESPACE:-monitoring}

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required."; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "helm is required."; exit 1; }

# Create namespace
echo "Creating monitoring namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Add Helm repos
echo "Adding Helm repositories..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
helm repo add grafana https://grafana.github.io/helm-charts || true
helm repo update

# Install Prometheus stack
echo "Installing Prometheus stack..."
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    --namespace $NAMESPACE \
    -f helm/monitoring/values-prometheus.yaml \
    --wait \
    --timeout 10m

# Create ConfigMap for custom dashboard
echo "Creating Grafana dashboard ConfigMap..."
kubectl create configmap grafana-dashboards-todo-chatbot \
    --namespace $NAMESPACE \
    --from-file=helm/monitoring/dashboards/todo-chatbot.json \
    --dry-run=client -o yaml | kubectl apply -f -

# Label ConfigMap for Grafana sidecar
kubectl label configmap grafana-dashboards-todo-chatbot \
    --namespace $NAMESPACE \
    grafana_dashboard=1 \
    --overwrite

echo ""
echo "=== Monitoring Setup Complete ==="
echo ""
echo "Access Grafana:"
echo "  kubectl port-forward svc/prometheus-grafana 3000:80 -n $NAMESPACE"
echo "  Open http://localhost:3000"
echo "  Default credentials: admin / admin"
echo ""
echo "Access Prometheus:"
echo "  kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n $NAMESPACE"
echo "  Open http://localhost:9090"
