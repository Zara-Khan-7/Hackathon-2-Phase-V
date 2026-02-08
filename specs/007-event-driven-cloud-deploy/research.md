# Research: Event-Driven Cloud Deployment

**Feature**: 007-event-driven-cloud-deploy
**Date**: 2026-02-09
**Status**: Complete

## Research Tasks

### 1. Dapr Pub/Sub with Kafka/Redpanda

**Decision**: Use Dapr Pub/Sub component with Redpanda (Kafka-compatible) for local development and Strimzi Kafka for production.

**Rationale**:
- Dapr abstracts Kafka client complexity - no direct kafka-python dependency
- Redpanda is simpler to run locally (single binary, no JVM, lower memory)
- Strimzi provides Kubernetes-native Kafka operator for production
- Same Dapr component configuration works for both

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| kafka-python direct | Full control | Constitution violation (III), vendor lock-in | ❌ Rejected |
| Confluent Cloud | Managed service | Cost exceeds free tier | ❌ Rejected |
| Azure Event Hubs | Kafka-compatible | Azure-specific, cost | ❌ Rejected |
| Redpanda + Strimzi | Open source, Dapr-native | Setup complexity | ✅ Selected |

**Implementation Pattern**:
```python
# Dapr Pub/Sub publish via HTTP
import httpx

DAPR_PORT = os.getenv("DAPR_HTTP_PORT", "3500")

async def publish_event(topic: str, data: dict):
    async with httpx.AsyncClient() as client:
        await client.post(
            f"http://localhost:{DAPR_PORT}/v1.0/publish/pubsub/{topic}",
            json=data
        )
```

---

### 2. Dapr Jobs API for Reminder Scheduling

**Decision**: Use Dapr Jobs API (v1.12+) for scheduling one-time reminder callbacks. Fallback to Dapr cron bindings if Jobs API unavailable.

**Rationale**:
- Jobs API provides precise one-time scheduling (better than polling)
- Built-in retry policies and failure handling
- No external scheduler dependency (Celery, APScheduler)
- Follows constitution principle III (Dapr-Native)

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Database polling | Simple | Resource waste, imprecise timing | ❌ Rejected |
| Celery + Redis | Mature | Additional dependency, not Dapr-native | ❌ Rejected |
| APScheduler | Python-native | In-process, not distributed | ❌ Rejected |
| Dapr Jobs API | Dapr-native, distributed | Requires v1.12+ | ✅ Selected |

**Implementation Pattern**:
```python
# Schedule a reminder job
async def schedule_reminder(task_id: str, remind_at: datetime):
    job = {
        "name": f"reminder-{task_id}",
        "schedule": remind_at.isoformat(),
        "data": {"task_id": task_id}
    }
    async with httpx.AsyncClient() as client:
        await client.post(
            f"http://localhost:{DAPR_PORT}/v1.0-alpha1/jobs/reminder-{task_id}",
            json=job
        )
```

---

### 3. Consumer Service Architecture

**Decision**: Three separate microservices (Notification, Recurring Task, Audit), each subscribed to relevant topics via Dapr subscription files.

**Rationale**:
- Separation of concerns - each service has single responsibility
- Independent scaling based on load
- Fault isolation - one service failure doesn't affect others
- Follows constitution principle II (Event-Driven Microservices)

**Subscription Pattern**:
```yaml
# dapr/components/subscriptions.yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: notification-sub
spec:
  pubsubname: pubsub
  topic: reminders
  route: /handle-reminder
---
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: audit-sub
spec:
  pubsubname: pubsub
  topic: task-events
  route: /handle-event
```

---

### 4. Idempotency Strategy

**Decision**: Use event_id as idempotency key stored in Dapr state store with TTL.

**Rationale**:
- At-least-once delivery requires idempotent consumers
- Dapr state store provides distributed key-value storage
- TTL prevents unbounded growth of idempotency records

**Implementation Pattern**:
```python
async def handle_event(event: dict):
    event_id = event["event_id"]

    # Check if already processed
    state = await dapr_client.get_state("statestore", f"processed:{event_id}")
    if state.data:
        return {"status": "DUPLICATE"}

    # Process event
    await process_event(event)

    # Mark as processed with 24h TTL
    await dapr_client.save_state(
        "statestore",
        f"processed:{event_id}",
        "1",
        metadata={"ttlInSeconds": "86400"}
    )
    return {"status": "SUCCESS"}
```

---

### 5. Oracle OKE Always Free Tier Constraints

**Decision**: Design for 4 OCPUs, 24GB RAM limit with aggressive resource requests/limits in Helm values.

**Rationale**:
- Oracle Always Free provides 4 OCPUs, 24GB RAM for Kubernetes
- Must fit: 4 services + Kafka (3-node) + Redis + Dapr sidecars + Prometheus/Grafana
- Lightweight Python images (Alpine-based) reduce memory footprint

**Resource Budget**:
| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| chat-api | 100m | 500m | 128Mi | 256Mi |
| notification | 50m | 200m | 64Mi | 128Mi |
| recurring-task | 50m | 200m | 64Mi | 128Mi |
| audit | 50m | 200m | 64Mi | 128Mi |
| Kafka (3-node) | 500m each | 1000m each | 1Gi each | 2Gi each |
| Redis | 100m | 200m | 128Mi | 256Mi |
| Prometheus | 100m | 500m | 256Mi | 512Mi |
| Grafana | 100m | 200m | 128Mi | 256Mi |
| **Total** | ~2100m | ~4500m | ~5.5Gi | ~10Gi |

**Fits within**: 4 OCPUs (4000m) and 24GB RAM ✅

---

### 6. CI/CD Pipeline Strategy

**Decision**: GitHub Actions with multi-stage workflow: build → test → push → deploy.

**Rationale**:
- GitHub Actions is free for public repos
- Native Docker layer caching
- OKE integration via kubectl/helm with kubeconfig secret
- Follows constitution principle I (Agentic Dev Stack)

**Pipeline Stages**:
```yaml
# .github/workflows/cd-oke.yaml
name: Deploy to OKE
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: docker/build-push-action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.OKE_KUBECONFIG }}
      - run: helm upgrade --install todo-chatbot ./helm/todo-chatbot
```

---

### 7. Strimzi vs Redpanda for Kubernetes Kafka

**Decision**: Strimzi for production (OKE), Redpanda for local development (Minikube).

**Rationale**:
- Strimzi: Full Kafka compatibility, Kubernetes-native, battle-tested
- Redpanda: Simpler, faster startup, lower memory, better for dev
- Both work with same Dapr Pub/Sub component configuration

**Comparison**:
| Feature | Strimzi | Redpanda |
|---------|---------|----------|
| Kafka compatibility | Full | Full |
| Resource usage | Higher (JVM) | Lower (C++) |
| Startup time | Slower | Faster |
| Maturity | High | Medium |
| Best for | Production | Development |

---

### 8. Monitoring Stack Selection

**Decision**: Prometheus + Grafana deployed via Helm charts with Dapr metrics integration.

**Rationale**:
- Prometheus: Industry standard, Dapr exports Prometheus metrics natively
- Grafana: Pre-built Dapr dashboards available
- Fits within Oracle Always Free resource budget
- Follows constitution principle VII (Observability)

**Dapr Metrics Configuration**:
```yaml
# dapr/config/config.yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: dapr-config
spec:
  metric:
    enabled: true
    port: 9090
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: http://zipkin:9411/api/v2/spans
```

---

## Summary

All NEEDS CLARIFICATION items have been resolved:

| Item | Resolution |
|------|------------|
| Kafka implementation | Dapr Pub/Sub with Redpanda (local) + Strimzi (prod) |
| Reminder scheduling | Dapr Jobs API with cron binding fallback |
| Consumer architecture | 3 separate microservices with Dapr subscriptions |
| Idempotency | Event_id in Dapr state store with TTL |
| OKE constraints | Resource budget fits 4 OCPU, 24GB |
| CI/CD | GitHub Actions with multi-stage pipeline |
| Monitoring | Prometheus + Grafana with Dapr metrics |

**Research Phase Complete** - Ready for Phase 1: Design & Contracts
