#!/bin/bash
# Local Validation Script for Todo Chatbot
# US6: Validates end-to-end functionality on Minikube

set -e

echo "=== Todo Chatbot Local Validation ==="

NAMESPACE=${NAMESPACE:-todo-chatbot}

# Check all pods are running
echo "Checking pod status..."
READY_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | grep Running | wc -l)
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers | wc -l)

echo "Pods running: $READY_PODS / $TOTAL_PODS"

if [ "$READY_PODS" -lt "$TOTAL_PODS" ]; then
    echo "WARNING: Not all pods are running"
    kubectl get pods -n $NAMESPACE
fi

# Port forward chat-api for testing
echo ""
echo "Setting up port forwarding..."
kubectl port-forward svc/todo-chatbot-chat-api 8000:8000 -n $NAMESPACE &
PF_PID=$!
sleep 5

# Test health endpoint
echo ""
echo "Testing health endpoint..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "✓ Health check passed"
else
    echo "✗ Health check failed"
fi

# Test task creation (requires authentication in real scenario)
echo ""
echo "Testing API endpoints..."
echo "Note: Full testing requires valid JWT token"

# Check Dapr sidecar
echo ""
echo "Checking Dapr sidecars..."
DAPR_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.containers[*].name}{"\n"}{end}' | grep daprd | wc -l)
echo "Dapr sidecars running: $DAPR_PODS"

# Check Kafka connectivity
echo ""
echo "Checking Kafka topics..."
kubectl exec -n kafka redpanda-0 -- rpk topic list 2>/dev/null || echo "Note: rpk command may not be available"

# Cleanup port forward
kill $PF_PID 2>/dev/null || true

echo ""
echo "=== Validation Complete ==="
echo ""
echo "Summary:"
echo "- Pods running: $READY_PODS / $TOTAL_PODS"
echo "- Dapr sidecars: $DAPR_PODS"
echo ""
echo "For full end-to-end testing, use the frontend or Postman with valid JWT tokens."
