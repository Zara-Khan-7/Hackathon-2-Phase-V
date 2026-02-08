# Implementation Plan: Event-Driven Cloud Deployment

**Branch**: `007-event-driven-cloud-deploy` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-event-driven-cloud-deploy/spec.md`

## Summary

Transform the Todo Chatbot from a monolithic architecture to a fully decoupled, event-driven system using Kafka (via Dapr Pub/Sub abstraction) with local Minikube validation and production deployment to Oracle Cloud OKE. The existing FastAPI backend will be enhanced to publish task events, while new microservices (Notification, Recurring Task, Audit) will consume these events asynchronously. Dapr provides the infrastructure abstraction layer for Pub/Sub, State Management, Secrets, and Jobs API.

## Technical Context

**Language/Version**: Python 3.11 (backend services), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Dapr SDK, httpx (async HTTP), Strimzi (Kafka operator)
**Storage**: Neon PostgreSQL (external, existing), Redis (Dapr state store)
**Testing**: pytest, pytest-asyncio, k6 (load testing)
**Target Platform**: Kubernetes (Minikube local, Oracle OKE cloud)
**Project Type**: Microservices (event-driven, containerized)
**Performance Goals**: Event latency <100ms, reminder timing <5s accuracy, 100 concurrent operations
**Constraints**: Oracle Always Free tier (4 OCPUs, 24GB RAM), Dapr v1.12+, no direct Kafka clients
**Scale/Scope**: 3 new microservices, 4 Kafka topics, 6 Dapr components, 1 CI/CD pipeline

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| I. Agentic Dev Stack Workflow | ✅ PASS | All implementation via Claude Code with PHR documentation |
| II. Event-Driven Microservices Architecture | ✅ PASS | Chat API as producer, 3 consumer services, Kafka topics |
| III. Dapr-Native Runtime Integration | ✅ PASS | All 6 required building blocks planned (Pub/Sub, State, Service Invocation, Bindings, Secrets, Jobs) |
| IV. Dual Deployment Strategy | ✅ PASS | Minikube local validation before OKE cloud deployment |
| V. Kafka-Centric Event Messaging | ✅ PASS | 4 topics defined (task-events, reminders, task-updates, recurring-tasks) |
| VI. Cost-Optimized Open Source Stack | ✅ PASS | Strimzi/Redpanda for Kafka, Oracle Always Free OKE |
| VII. Observability and Monitoring | ✅ PASS | Health/ready/metrics endpoints, structured logging, Prometheus/Grafana |

**Gate Status**: ✅ PASSED - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/007-event-driven-cloud-deploy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (event schemas, API specs)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
# Event-Driven Microservices Architecture

services/
├── chat-api/                    # Enhanced existing backend (producer)
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── events.py        # Dapr Pub/Sub publisher (enhanced)
│   │   │   ├── reminder.py
│   │   │   └── recurring.py
│   │   └── dapr/
│   │       └── callbacks.py     # Dapr Jobs API callback handler
│   ├── Dockerfile
│   └── requirements.txt
│
├── notification-service/        # NEW: Consumes reminders topic
│   ├── app/
│   │   ├── main.py
│   │   └── handlers/
│   │       └── reminder.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── recurring-task-service/      # NEW: Consumes task-events topic
│   ├── app/
│   │   ├── main.py
│   │   └── handlers/
│   │       └── task_completed.py
│   ├── Dockerfile
│   └── requirements.txt
│
└── audit-service/               # NEW: Consumes task-events topic
    ├── app/
    │   ├── main.py
    │   └── handlers/
    │       └── audit_log.py
    ├── Dockerfile
    └── requirements.txt

dapr/
├── components/
│   ├── pubsub.yaml              # Kafka/Redpanda Pub/Sub component
│   ├── statestore.yaml          # Redis state store
│   ├── secrets.yaml             # Kubernetes secrets store
│   └── bindings/
│       └── cron.yaml            # Cron binding for scheduled jobs
└── config/
    └── config.yaml              # Dapr runtime configuration

helm/
├── todo-chatbot/                # Umbrella chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── charts/                  # Subcharts
│       ├── chat-api/
│       ├── notification/
│       ├── recurring-task/
│       └── audit/
├── dapr-components/             # Dapr component chart
└── kafka/                       # Strimzi Kafka chart

.github/
└── workflows/
    ├── ci.yaml                  # Build, test, push images
    └── cd-oke.yaml              # Deploy to Oracle OKE

frontend/                        # Existing Next.js frontend (unchanged structure)
└── src/
```

**Structure Decision**: Microservices architecture with 4 services (1 enhanced producer, 3 new consumers), Dapr components in separate directory, Helm umbrella chart with subcharts, GitHub Actions for CI/CD.

## Complexity Tracking

> No constitution violations requiring justification. Architecture aligns with all principles.

## Architecture Overview

### Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Event-Driven Architecture                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐         ┌────────────────────────┐               │
│   │   Frontend   │ ──────> │      Chat API          │               │
│   │  (Next.js)   │ <────── │   (FastAPI + Dapr)     │               │
│   └──────────────┘         └──────────┬─────────────┘               │
│                                       │                              │
│                                       │ Dapr Pub/Sub                 │
│                                       ▼                              │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    Kafka (Strimzi/Redpanda)               │     │
│   │  ┌─────────────┐ ┌───────────┐ ┌──────────────┐ ┌───────┐│     │
│   │  │ task-events │ │ reminders │ │ task-updates │ │recur- ││     │
│   │  │             │ │           │ │              │ │ring   ││     │
│   │  └──────┬──────┘ └─────┬─────┘ └──────┬───────┘ └───────┘│     │
│   └─────────┼──────────────┼──────────────┼──────────────────┘     │
│             │              │              │                         │
│   ┌─────────▼────┐  ┌──────▼──────┐  ┌────▼─────────┐              │
│   │    Audit     │  │ Notification │  │  WebSocket   │              │
│   │   Service    │  │   Service    │  │   (Future)   │              │
│   └──────────────┘  └─────────────┘  └──────────────┘              │
│             │                                                        │
│   ┌─────────▼────┐                                                  │
│   │  Recurring   │                                                  │
│   │Task Service  │                                                  │
│   └──────────────┘                                                  │
│                                                                      │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                  Neon PostgreSQL (External)               │     │
│   └───────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Dapr Building Blocks Usage

| Building Block | Component | Usage |
|----------------|-----------|-------|
| Pub/Sub | `pubsub` | Kafka abstraction for all event publishing/subscription |
| State Management | `statestore` | Redis for job state, idempotency keys |
| Service Invocation | N/A | Internal service calls with retries |
| Secrets | `secrets` | Kubernetes secrets for DB credentials, API keys |
| Jobs API | N/A | Scheduled reminder delivery (replaces polling) |
| Bindings | `cron` | Backup cron triggers if Jobs API unavailable |

## Implementation Phases

### Phase A: Event-Driven Architecture & Kafka Integration
- Enhance events.py with Dapr HTTP client for Pub/Sub
- Define event schemas for all 4 topics
- Implement at-least-once delivery with idempotency

### Phase B: Full Dapr Integration
- Configure Dapr components (pubsub, statestore, secrets)
- Implement Jobs API for reminder scheduling
- Convert direct dependencies to Dapr building blocks

### Phase C: Separate Microservices
- Create Notification Service (consume reminders topic)
- Create Recurring Task Service (consume task-events, filter completed)
- Create Audit Service (consume all task-events)

### Phase D: Local Deployment (Minikube)
- Strimzi/Redpanda Kafka operator
- Dapr sidecar injection
- End-to-end validation scripts

### Phase E: Cloud Deployment (Oracle OKE)
- OKE cluster provisioning
- Helm chart deployment
- GitHub Actions CI/CD pipeline
- Monitoring with Prometheus/Grafana

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Oracle Always Free resource limits | Resource budgets in Helm values, lightweight images |
| Kafka complexity on Minikube | Use Redpanda as simpler alternative |
| Dapr Jobs API availability (v1.12+) | Fallback to Dapr cron bindings |
| Event ordering requirements | Design for eventual consistency, idempotent consumers |

## Success Metrics

- [ ] SC-001: Events publish within 100ms of database commit
- [ ] SC-002: Reminders fire within 5 seconds of scheduled time
- [ ] SC-003: Consumers process events within 1 second
- [ ] SC-004: System maintains delivery during restarts
- [ ] SC-005: Minikube deploy completes in <10 minutes
- [ ] SC-006: OKE CI/CD pipeline completes in <15 minutes
- [ ] SC-007: Zero direct Kafka dependencies in code
- [ ] SC-008: Fits Oracle Always Free tier limits
- [ ] SC-009: Handles 100 concurrent operations
- [ ] SC-010: Monitoring dashboards <30s lag
