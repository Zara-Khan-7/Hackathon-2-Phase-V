# Implementation Plan: Local Kubernetes Deployment of Todo Chatbot

**Branch**: `005-k8s-deployment` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-k8s-deployment/spec.md`

## Summary

Deploy the Phase III AI-Native Todo Chatbot to a local Kubernetes environment using AI-assisted tooling. This involves containerizing the Next.js frontend and FastAPI backend using Gordon/Docker AI, creating Helm charts for orchestration, deploying to Minikube using kubectl-ai and Kagent, and verifying end-to-end functionality of the chatbot including authentication, task CRUD, and AI chat features.

## Technical Context

**Language/Version**: Python 3.11+ (backend), Node.js 18+/TypeScript (frontend)
**Primary Dependencies**: Docker, Minikube, Helm 3.x, kubectl-ai, Kagent, Gordon (Docker AI)
**Storage**: Neon PostgreSQL (external, accessed via connection string)
**Testing**: Manual verification via kubectl, health endpoints, and end-to-end user flows
**Target Platform**: Local Minikube cluster (Windows host with Docker Desktop)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Pods reach Running state within 3 minutes, health checks respond in <1s
**Constraints**: All operations via AI agents, no manual YAML editing, images <500MB
**Scale/Scope**: 2 replicas per service, single Minikube node, local development environment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. AI-Agent-First Development | All work via AI agents (Claude Code, kubectl-ai, Kagent, Gordon) | ✅ PASS - Plan uses Gordon for containers, kubectl-ai for deployment, Kagent for optimization |
| II. Container-Native Architecture | Multi-stage builds, minimal images, health endpoints, no secrets in layers | ✅ PASS - Dockerfiles will use Alpine/distroless, multi-stage builds, semantic versioning |
| III. Helm-Centric Orchestration | All K8s resources via Helm, standard chart structure, parameterized values | ✅ PASS - Helm charts with templates/, values.yaml, NOTES.txt per constitution |
| IV. AI-Assisted Operations | kubectl-ai and Kagent for operations, PHR capture | ✅ PASS - kubectl-ai for deployment, Kagent for cluster analysis |
| V. Verification-Driven Deployment | Health endpoints, frontend rendering, backend API, DB connectivity, LLM integration | ✅ PASS - 6 user stories include comprehensive verification steps |
| VI. Observability by Default | Health/readiness/liveness endpoints, structured logs, metrics | ✅ PASS - Probes configured in Helm charts, JSON logging to stdout |

**Gate Result**: PASS - All 6 constitution principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/005-k8s-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (K8s resource model)
├── quickstart.md        # Phase 1 output (deployment guide)
├── contracts/           # Phase 1 output (Helm values schema)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/                 # FastAPI application (Phase III)
├── Dockerfile           # NEW: Multi-stage Docker build
└── requirements.txt

frontend/
├── src/                 # Next.js application (Phase III)
├── Dockerfile           # NEW: Multi-stage Docker build
├── package.json
└── next.config.js

helm/
├── backend/             # NEW: Backend Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   └── _helpers.tpl
│   └── NOTES.txt
├── frontend/            # NEW: Frontend Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── templates/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   └── _helpers.tpl
│   └── NOTES.txt
└── todo-chatbot/        # OPTIONAL: Umbrella chart
    ├── Chart.yaml
    └── values.yaml
```

**Structure Decision**: Web application structure with separate frontend/backend directories. Helm charts placed in `helm/` directory at repository root following Helm best practices. Each application has its own chart for independent versioning and deployment.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Separate Helm charts | Backend and frontend as independent charts | Enables independent versioning, scaling, and deployment rollback |
| No umbrella chart initially | Deploy charts separately | Reduces complexity for local development; umbrella chart can be added later |
| NodePort over Ingress | Use NodePort for local access | Simpler for Minikube; Ingress optional enhancement |

## Execution Steps (User Input)

Based on the user's 7-step plan:

1. **Containerize** - Gordon AI generates Dockerfiles for frontend and backend
2. **Minikube Setup** - Start cluster, configure resources using kubectl-ai
3. **Helm Charts** - Generate chart structure for both applications
4. **Deploy** - Install Helm releases using kubectl-ai assistance
5. **Optimize** - Kagent analyzes and suggests resource optimizations
6. **Verify** - Pod health, service endpoints, and chatbot functionality
7. **Document** - Final workflow documentation in quickstart.md
