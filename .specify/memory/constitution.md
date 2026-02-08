<!--
  Sync Impact Report
  ==================
  Version change: 1.0.0 → 2.0.0 (MAJOR - architectural paradigm shift to event-driven)

  Modified Principles:
    - I. AI-Agent-First Development → I. Agentic Dev Stack Workflow (expanded scope)
    - II. Container-Native Architecture → II. Event-Driven Microservices Architecture (paradigm shift)
    - III. Helm-Centric Orchestration → III. Dapr-Native Runtime Integration (new abstraction layer)
    - IV. AI-Assisted Operations → IV. Dual Deployment Strategy (expanded deployment targets)
    - V. Verification-Driven Deployment → V. Kafka-Centric Event Messaging (new principle)
    - VI. Observability by Default → VI. Cost-Optimized Open Source Stack (new principle)
    - (NEW) VII. Observability and Monitoring by Default

  Added Sections:
    - Dapr Building Blocks (detailed usage guide)
    - Event Schema Standards
    - Kafka Topic Architecture
    - CI/CD Pipeline Requirements
    - Cloud Provider Constraints

  Removed Sections:
    - None (all Phase IV content superseded or evolved)

  Templates requiring updates:
    - .specify/templates/plan-template.md: ✅ compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md: ✅ compatible (no changes required)
    - .specify/templates/tasks-template.md: ✅ compatible (phases can accommodate new patterns)

  Follow-up TODOs: None
-->

# Phase V Advanced Cloud Deployment for Event-Driven Todo Chatbot Constitution

## Core Principles

### I. Agentic Dev Stack Workflow

Every development step MUST follow the Spec-Driven Development workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. Manual coding is strictly prohibited. This ensures:

- Reproducibility of all operations via AI-generated commands and artifacts
- Full traceability of decisions in PHR (Prompt History Records)
- Consistent application of best practices through agent guardrails
- All prompts, iterations, and reviews documented for judging
- Accelerated development through AI-assisted automation

**Enforcement**: All code and configurations MUST originate from Claude-generated outputs based on specs and tasks. Direct edits to source files without corresponding PHR documentation are non-compliant.

**Rationale**: Phase V validates that complex event-driven cloud deployments can be achieved entirely through AI orchestration, establishing patterns for enterprise-grade AI-first DevOps workflows.

### II. Event-Driven Microservices Architecture

All inter-service communication MUST use asynchronous event-driven patterns via Kafka (or Redpanda). Tight coupling through direct API calls between services is prohibited. The architecture MUST:

- Use Chat API as event producer for all task operations
- Implement separate consumer services: Notification Service, Recurring Task Service, Audit Service
- Store persistent state in external Neon PostgreSQL database
- Enable real-time client sync via WebSocket connections
- Follow loose coupling principles with explicit event contracts

**Event Flow Pattern**:
```
Chat API → Kafka Topic → Consumer Service → State Update → WebSocket Notification
```

**Rationale**: Event-driven architecture enables horizontal scaling, fault isolation, and real-time capabilities essential for production-grade chatbot systems.

### III. Dapr-Native Runtime Integration

All implementations MUST incorporate Dapr building blocks for infrastructure abstraction. Direct infrastructure access (raw Kafka clients, direct database connections from multiple services) is prohibited in favor of Dapr APIs.

**Required Dapr Building Blocks**:

| Building Block | Purpose | Implementation |
|----------------|---------|----------------|
| Pub/Sub | Kafka/Redpanda abstraction | Event publishing and subscription |
| State Management | Conversation and task state | Redis or PostgreSQL state store |
| Service Invocation | Inter-service communication | Service-to-service calls with retries |
| Bindings | External system integration | Cron triggers for scheduling |
| Secrets Management | Credential handling | Kubernetes secrets or Dapr API |
| Jobs API | Precise scheduling | Reminder scheduling (preferred over polling) |

**Rationale**: Dapr provides infrastructure portability, allowing the same application code to run across local Minikube and production cloud environments without modification.

### IV. Dual Deployment Strategy

All deployment artifacts MUST support both local development and production cloud environments:

**Local Environment (Minikube)**:
- Full Dapr sidecar injection
- Redpanda Docker for Kafka simulation
- Local Neon PostgreSQL or containerized PostgreSQL
- All features operational for development and testing

**Production Cloud Environment (AKS/GKE/OKE)**:
- Full Dapr runtime with production configuration
- Managed or self-hosted Kafka/Redpanda cluster
- Neon PostgreSQL for persistent state
- CI/CD pipeline via GitHub Actions
- Monitoring and logging (Prometheus, Grafana, ELK)

**Deployment Sequence**: Local Minikube MUST validate functionality before any cloud deployment.

**Rationale**: Dual deployment ensures development velocity while maintaining production readiness; cloud deployment proves enterprise viability.

### V. Kafka-Centric Event Messaging

All event communication MUST use defined Kafka topics with explicit schemas:

**Required Topics**:

| Topic | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| `task-events` | Chat API | Audit, Notification | Task CRUD operations |
| `reminders` | Scheduler | Notification | Due date and reminder alerts |
| `task-updates` | All services | Client Sync | Real-time UI updates |
| `recurring-tasks` | Cron/Jobs API | Task Service | Recurring task generation |

**Event Schema Requirements**:
- All events MUST include: `event_id`, `event_type`, `timestamp`, `user_id`, `payload`
- Schemas MUST be version-controlled and documented
- Breaking schema changes require ADR documentation

**Rationale**: Explicit topic and schema design prevents integration failures and enables independent service evolution.

### VI. Cost-Optimized Open Source Stack

All implementations MUST prioritize open-source and free-tier services to minimize costs while enabling learning:

**Cloud Credit Constraints**:
- Azure: $200/30 days (Azure for Students or Free Trial)
- Oracle: Always Free OKE tier
- Google: $300/90 days (Free Trial)

**Fallback Strategy**:
- Managed Kafka access issues → Self-hosted Strimzi for Kafka
- Cloud provider limitations → Oracle Always Free as fallback
- High-cost services → Open-source alternatives (Redpanda over Confluent Cloud)

**Prohibited**: Exceeding free-tier limits without explicit justification in an ADR.

**Rationale**: Cost optimization ensures project sustainability and demonstrates practical cloud resource management.

### VII. Observability and Monitoring by Default

All deployed components MUST expose observability endpoints and integrate with monitoring infrastructure:

**Required Endpoints**:
- `/health` - Liveness probe endpoint
- `/ready` - Readiness probe endpoint
- `/metrics` - Prometheus-compatible metrics (where applicable)

**Logging Standards**:
- Structured JSON logs to stdout/stderr
- Include correlation IDs for distributed tracing
- Log levels: DEBUG, INFO, WARN, ERROR

**Monitoring Stack**:
- Prometheus for metrics collection
- Grafana for visualization
- ELK stack (or cloud equivalent) for log aggregation

**Rationale**: Observability enables rapid diagnosis of issues in distributed event-driven systems where traditional debugging is insufficient.

## Feature Requirements

### Advanced Level Features (Required)

1. **Recurring Tasks**
   - Daily, weekly, monthly recurrence patterns
   - Integration with Dapr Jobs API or cron bindings
   - Event-driven task generation via `recurring-tasks` topic

2. **Due Dates and Reminders**
   - Precise reminder scheduling via Dapr Jobs API
   - Push notifications via `reminders` topic
   - Timezone-aware scheduling

### Intermediate Level Features (Required)

1. **Priorities** - Task priority levels (High, Medium, Low)
2. **Tags** - User-defined categorization
3. **Search** - Full-text search across tasks
4. **Filter** - Filter by status, priority, tags, due date
5. **Sort** - Sort by creation date, due date, priority

All features MUST integrate with Kafka topics and event schemas as specified.

## Tooling Standards

### Required Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| Claude Code | Development orchestration | Spec-driven development and code generation |
| Docker | Container image building | AI-assisted Dockerfile generation |
| Minikube | Local Kubernetes cluster | Development and testing environment |
| Helm | Kubernetes package management | Chart creation, deployment, upgrades |
| Dapr CLI | Dapr runtime management | Sidecar injection, component configuration |
| kubectl | Kubernetes operations | Resource management and debugging |
| GitHub Actions | CI/CD automation | Build, test, deploy pipelines |

### Prohibited Practices

- Manual editing of source code without PHR documentation
- Hardcoding secrets in manifests, environment variables, or code
- Direct inter-service API calls bypassing Kafka
- Deploying without local Minikube validation first
- Using raw Kafka clients instead of Dapr Pub/Sub
- Exceeding cloud free-tier credits without ADR justification

## Development Workflow

### Phase Sequence

1. **Specify** - Create feature specification via `/sp.specify`
2. **Plan** - Generate implementation plan via `/sp.plan`
3. **Tasks** - Break into executable tasks via `/sp.tasks`
4. **Implement** - Execute tasks via Claude Code (green phase)
5. **Deploy Local** - Deploy to Minikube with Dapr
6. **Verify Local** - Validate all features on Minikube
7. **Deploy Cloud** - Deploy to AKS/GKE/OKE with CI/CD
8. **Verify Cloud** - End-to-end cloud validation
9. **Document** - Capture in PHRs and ADRs

### Artifact Locations

```
specs/<feature>/
├── spec.md          # Feature specification
├── plan.md          # Implementation plan
├── tasks.md         # Task breakdown
└── contracts/       # API and event contracts

helm/
├── todo-chatbot/    # Umbrella chart
├── chat-api/        # Chat API service chart
├── notification/    # Notification service chart
├── recurring-task/  # Recurring task service chart
└── audit/           # Audit service chart

dapr/
├── components/      # Dapr component YAML files
└── config/          # Dapr configuration files

.github/
└── workflows/       # GitHub Actions CI/CD pipelines
```

## Governance

### Amendment Process

1. Propose amendment with rationale in a PHR
2. Evaluate impact on existing principles and templates
3. Update constitution with version increment
4. Propagate changes to dependent templates if required
5. Document in ADR if architecturally significant

### Versioning Policy

- **MAJOR**: Principle removal, architectural paradigm shift, or workflow redefinition
- **MINOR**: New principle added or substantial guidance expansion
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance

All PRs and deployments MUST demonstrate alignment with these principles. The Constitution Check in plan.md MUST reference this document. Non-compliance requires explicit ADR justification.

### Success Criteria

1. **Local Deployment**: All features operational on Minikube with Dapr sidecars running and Kafka topics handling events without errors
2. **Cloud Deployment**: Successful deployment to AKS/GKE/OKE with full Dapr integration, managed or self-hosted Kafka, operational CI/CD pipeline, and active monitoring
3. **Event-Driven Validation**: All inter-service communication via Kafka events (no direct API calls)
4. **Documentation Compliance**: Complete setup guides, component YAMLs, Python client examples, and architecture diagrams

**Version**: 2.0.0 | **Ratified**: 2026-01-23 | **Last Amended**: 2026-02-08
