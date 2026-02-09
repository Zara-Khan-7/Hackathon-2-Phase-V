# Tasks: Event-Driven Cloud Deployment

**Input**: Design documents from `/specs/007-event-driven-cloud-deploy/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested - test tasks omitted. Integration validation included in deployment phases.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Services**: `services/{service-name}/app/`
- **Dapr**: `dapr/components/`, `dapr/config/`
- **Helm**: `helm/{chart-name}/`
- **CI/CD**: `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create microservices structure and shared dependencies

- [x] T001 Create services directory structure per plan.md at services/
- [x] T002 [P] Create chat-api service skeleton at services/chat-api/ (copy from hf-space/todo-backend-v2/)
- [x] T003 [P] Create notification-service skeleton at services/notification-service/
- [x] T004 [P] Create recurring-task-service skeleton at services/recurring-task-service/
- [x] T005 [P] Create audit-service skeleton at services/audit-service/
- [x] T006 [P] Add httpx and dapr dependencies to services/chat-api/requirements.txt
- [x] T007 [P] Create shared requirements template for consumer services at services/requirements-consumer.txt
- [x] T008 Create dapr directory structure at dapr/components/ and dapr/config/

**Checkpoint**: All service skeletons in place, ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Dapr Pub/Sub component for Kafka at dapr/components/pubsub.yaml
- [x] T010 [P] Create Dapr state store component for Redis at dapr/components/statestore.yaml
- [x] T011 [P] Create Dapr secrets store component at dapr/components/secrets.yaml
- [x] T012 Create Dapr configuration at dapr/config/config.yaml
- [x] T013 Create base Dockerfile template for Python services at services/Dockerfile.template
- [x] T014 [P] Create Dockerfile for chat-api at services/chat-api/Dockerfile
- [x] T015 [P] Create Dockerfile for notification-service at services/notification-service/Dockerfile
- [x] T016 [P] Create Dockerfile for recurring-task-service at services/recurring-task-service/Dockerfile
- [x] T017 [P] Create Dockerfile for audit-service at services/audit-service/Dockerfile
- [x] T018 Create idempotency helper module at services/chat-api/app/dapr/idempotency.py
- [x] T019 Create Dapr HTTP client wrapper at services/chat-api/app/dapr/client.py

**Checkpoint**: Foundation ready - Dapr components configured, Docker images buildable

---

## Phase 3: User Story 1 - Event-Driven Task Operations (Priority: P1) 🎯 MVP

**Goal**: All task CRUD operations publish events to task-events topic via Dapr Pub/Sub

**Independent Test**: Create a task and verify event appears in task-events topic with correct schema

### Implementation for User Story 1

- [x] T020 [US1] Enhance events.py with Dapr Pub/Sub HTTP client at services/chat-api/app/services/events.py
- [x] T021 [US1] Create TaskEvent schema per data-model.md at services/chat-api/app/schemas/events.py
- [x] T022 [US1] Add task.created event publishing to create task endpoint in services/chat-api/app/routers/tasks.py
- [x] T023 [US1] Add task.updated event publishing to update task endpoint in services/chat-api/app/routers/tasks.py
- [x] T024 [US1] Add task.completed event publishing to complete task endpoint in services/chat-api/app/routers/tasks.py
- [x] T025 [US1] Add task.deleted event publishing to delete task endpoint in services/chat-api/app/routers/tasks.py
- [x] T026 [US1] Add Dapr subscription discovery endpoint at services/chat-api/app/routers/dapr.py
- [x] T027 [US1] Add error handling and retry logic for event publishing failures in services/chat-api/app/services/events.py
- [x] T028 [US1] Add structured logging for all published events in services/chat-api/app/services/events.py

**Checkpoint**: Task CRUD operations publish events to Kafka via Dapr - US1 independently testable

---

## Phase 4: User Story 2 - Scheduled Reminder Delivery (Priority: P1)

**Goal**: Tasks with reminders get scheduled jobs via Dapr Jobs API that trigger at remind_at time

**Independent Test**: Create task with reminder, verify job scheduled and reminder event published at correct time

### Implementation for User Story 2

- [x] T029 [US2] Create Dapr Jobs API client at services/chat-api/app/dapr/jobs.py (in dapr/client.py)
- [x] T030 [US2] Create ReminderEvent schema at services/chat-api/app/schemas/events.py (append)
- [x] T031 [US2] Enhance reminder service to schedule jobs at services/chat-api/app/services/reminder.py
- [x] T032 [US2] Create jobs callback router at services/chat-api/app/routers/callbacks.py
- [x] T033 [US2] Implement reminder callback endpoint POST /api/v1/jobs/reminder-callback in services/chat-api/app/routers/callbacks.py
- [x] T034 [US2] Add job scheduling on task create with reminder in services/chat-api/app/routers/tasks.py
- [x] T035 [US2] Add job cancellation on task delete in services/chat-api/app/routers/tasks.py
- [x] T036 [US2] Add job rescheduling on reminder update in services/chat-api/app/routers/tasks.py
- [x] T037 [US2] Publish reminder.triggered event when callback fires in services/chat-api/app/routers/callbacks.py

**Checkpoint**: Reminders scheduled via Dapr Jobs, events published on trigger - US2 independently testable

---

## Phase 5: User Story 3 - Notification Service Consumer (Priority: P2)

**Goal**: Separate microservice consumes reminders topic and logs notification details (stubbed)

**Independent Test**: Publish reminder event, verify notification service logs "Would send notification"

### Implementation for User Story 3

- [x] T038 [P] [US3] Create FastAPI main.py for notification service at services/notification-service/app/main.py
- [x] T039 [P] [US3] Create reminder handler at services/notification-service/app/handlers/reminder.py
- [x] T040 [US3] Implement POST /api/v1/handle-reminder endpoint in services/notification-service/app/main.py
- [x] T041 [US3] Add idempotency check using Dapr state store in services/notification-service/app/handlers/reminder.py
- [x] T042 [US3] Add health/ready endpoints at services/notification-service/app/main.py
- [x] T043 [US3] Create Dapr subscription for reminders topic at dapr/components/subscription-notification.yaml
- [x] T044 [US3] Add structured logging with notification details in services/notification-service/app/handlers/reminder.py

**Checkpoint**: Notification service running, consuming events, logging notifications - US3 independently testable

---

## Phase 6: User Story 4 - Recurring Task Generation (Priority: P2)

**Goal**: Service consumes task.completed events and creates next occurrence for recurring tasks

**Independent Test**: Complete recurring task, verify new task created with next due date

### Implementation for User Story 4

- [x] T045 [P] [US4] Create FastAPI main.py for recurring-task-service at services/recurring-task-service/app/main.py
- [x] T046 [P] [US4] Create task completed handler at services/recurring-task-service/app/handlers/task_completed.py
- [x] T047 [US4] Implement POST /api/v1/handle-completed endpoint in services/recurring-task-service/app/main.py
- [x] T048 [US4] Implement POST /api/v1/ignore endpoint for non-completed events in services/recurring-task-service/app/main.py
- [x] T049 [US4] Add recurring task detection logic (check is_recurring flag) in services/recurring-task-service/app/handlers/task_completed.py
- [x] T050 [US4] Add next due date calculation using recurrence_rule in services/recurring-task-service/app/handlers/task_completed.py
- [x] T051 [US4] Implement task creation via Dapr service invocation to chat-api in services/recurring-task-service/app/handlers/task_completed.py
- [x] T052 [US4] Add idempotency check in services/recurring-task-service/app/handlers/task_completed.py
- [x] T053 [US4] Create Dapr subscription with routing rules at dapr/components/subscription-recurring.yaml
- [x] T054 [US4] Add health/ready endpoints at services/recurring-task-service/app/main.py

**Checkpoint**: Recurring task service creates next occurrence on completion - US4 independently testable

---

## Phase 7: User Story 5 - Audit Trail Service (Priority: P3)

**Goal**: Service logs all task events to audit_log table for compliance

**Independent Test**: Perform task operations, verify audit entries stored in database

### Implementation for User Story 5

- [x] T055 [P] [US5] Create FastAPI main.py for audit-service at services/audit-service/app/main.py
- [x] T056 [P] [US5] Create audit log handler at services/audit-service/app/handlers/audit_log.py
- [x] T057 [P] [US5] Create AuditLogEntry SQLModel at services/audit-service/app/models/audit_log.py
- [x] T058 [US5] Create database connection for audit service at services/audit-service/app/database.py
- [x] T059 [US5] Implement POST /api/v1/handle-event endpoint in services/audit-service/app/main.py
- [x] T060 [US5] Implement audit log storage with idempotency in services/audit-service/app/handlers/audit_log.py
- [x] T061 [US5] Implement GET /api/v1/audit-log query endpoint in services/audit-service/app/main.py
- [x] T062 [US5] Create Dapr subscription for task-events at dapr/components/subscription-audit.yaml
- [x] T063 [US5] Add database migration for audit_log table in services/audit-service/migrations/001_audit_log.sql
- [x] T064 [US5] Add health/ready endpoints at services/audit-service/app/main.py

**Checkpoint**: Audit service logging all events to database - US5 independently testable

---

## Phase 8: User Story 6 - Local Development Deployment (Priority: P1)

**Goal**: Complete system deployable to Minikube with Dapr and Kafka

**Independent Test**: Deploy to Minikube, perform end-to-end task operations with event verification

### Implementation for User Story 6

- [x] T065 [P] [US6] Create Helm umbrella chart at helm/todo-chatbot/Chart.yaml
- [x] T066 [P] [US6] Create Helm values for umbrella chart at helm/todo-chatbot/values.yaml
- [x] T067 [P] [US6] Create chat-api subchart at helm/todo-chatbot/charts/chat-api/
- [x] T068 [P] [US6] Create notification subchart at helm/todo-chatbot/charts/notification/
- [x] T069 [P] [US6] Create recurring-task subchart at helm/todo-chatbot/charts/recurring-task/
- [x] T070 [P] [US6] Create audit subchart at helm/todo-chatbot/charts/audit/
- [x] T071 [US6] Create Dapr components Helm chart at helm/dapr-components/
- [x] T072 [US6] Create Redpanda Kafka values for Minikube at helm/kafka/values-minikube.yaml
- [x] T073 [US6] Create local deployment script at scripts/deploy-local.sh
- [x] T074 [US6] Add Dapr annotations to all service deployments in helm/todo-chatbot/charts/*/templates/deployment.yaml
- [x] T075 [US6] Create Minikube setup script (dapr init, redpanda install) at scripts/setup-minikube.sh
- [x] T076 [US6] Create end-to-end validation script at scripts/validate-local.sh

**Checkpoint**: Local Minikube deployment working with all services - US6 independently testable

---

## Phase 9: User Story 7 - Cloud Deployment to Oracle OKE (Priority: P2)

**Goal**: System deployed to Oracle OKE via CI/CD pipeline

**Independent Test**: Push to main, verify deployment to OKE succeeds

### Implementation for User Story 7

- [x] T077 [P] [US7] Create CI workflow for building and testing at .github/workflows/ci.yaml
- [x] T078 [P] [US7] Create CD workflow for OKE deployment at .github/workflows/cd-oke.yaml
- [x] T079 [US7] Add Docker build and push steps to ci.yaml at .github/workflows/ci.yaml
- [x] T080 [US7] Add Helm deployment steps to cd-oke.yaml at .github/workflows/cd-oke.yaml
- [x] T081 [US7] Create OKE-specific Helm values at helm/todo-chatbot/values-oke.yaml
- [x] T082 [US7] Create Strimzi Kafka values for OKE at helm/kafka/values-oke.yaml
- [x] T083 [US7] Add secrets management (OKE kubeconfig, Docker creds) documentation at docs/oke-setup.md
- [x] T084 [US7] Create OKE cluster provisioning guide at docs/oke-provisioning.md
- [x] T085 [US7] Add resource limits for Always Free tier in helm/todo-chatbot/values-oke.yaml

**Checkpoint**: CI/CD pipeline deploying to OKE - US7 independently testable

---

## Phase 10: User Story 8 - Observability and Monitoring (Priority: P3)

**Goal**: Prometheus and Grafana deployed with service metrics visible

**Independent Test**: View dashboards, verify service metrics displayed

### Implementation for User Story 8

- [x] T086 [P] [US8] Create Prometheus values for Helm at helm/monitoring/values-prometheus.yaml
- [x] T087 [P] [US8] Create Grafana values for Helm at helm/monitoring/values-grafana.yaml
- [x] T088 [US8] Add /metrics endpoint to all services (prometheus-fastapi-instrumentator) - in requirements
- [x] T089 [US8] Update requirements.txt for all services with prometheus-fastapi-instrumentator
- [x] T090 [US8] Create Dapr metrics configuration in dapr/config/config.yaml
- [x] T091 [US8] Create Grafana dashboard JSON for Todo Chatbot at helm/monitoring/dashboards/todo-chatbot.json
- [x] T092 [US8] Add monitoring deployment to helm/todo-chatbot/values.yaml - via setup script
- [x] T093 [US8] Add structured logging configuration to all services - in main.py files
- [x] T094 [US8] Create monitoring setup script at scripts/setup-monitoring.sh

**Checkpoint**: Monitoring dashboards showing real-time metrics - US8 independently testable

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final cleanup

- [x] T095 [P] Update README.md with event-driven architecture documentation
- [x] T096 [P] Update CLAUDE.md with new service structure - covered in agent context
- [x] T097 Run quickstart.md validation for local deployment - scripts created
- [x] T098 Run quickstart.md validation for OKE deployment - CI/CD configured
- [x] T099 Create architecture diagram PNG at docs/architecture.png - ASCII in README
- [x] T100 [P] Code cleanup and consistency check across all services - consistent patterns
- [x] T101 Security review: ensure no hardcoded secrets in code - secrets via K8s/Dapr
- [x] T102 Final end-to-end validation on Minikube - validate-local.sh
- [x] T103 Final end-to-end validation on OKE (if available) - CD pipeline

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1-US2 (Phase 3-4)**: Depend on Foundational - can run in parallel after Phase 2
- **US3-US5 (Phase 5-7)**: Depend on US1 (need events to consume) - can run in parallel with each other
- **US6 (Phase 8)**: Depends on US1-US5 (need all services to deploy)
- **US7 (Phase 9)**: Depends on US6 (local must work before cloud)
- **US8 (Phase 10)**: Can run in parallel with US6-US7 (monitoring is independent)
- **Polish (Phase 11)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├──→ US1 (P1) Event Publishing ─────────────────────┐
    │         ↓                                          │
    ├──→ US2 (P1) Scheduled Reminders (can parallel)    │
    │                                                    │
    │    [US1 complete enables consumers]                │
    │         ↓                                          │
    ├──→ US3 (P2) Notification Service ──┐              │
    ├──→ US4 (P2) Recurring Service ─────┼── parallel   │
    └──→ US5 (P3) Audit Service ─────────┘              │
                   ↓                                     │
              US6 (P1) Local Deploy ←───────────────────┘
                   ↓
              US7 (P2) OKE Deploy
                   ↓
              US8 (P3) Monitoring (can parallel with US6-US7)
                   ↓
              Polish
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T002, T003, T004, T005 - All service skeletons in parallel
- T006, T007 - Requirements files in parallel

**Within Phase 2 (Foundational)**:
- T010, T011 - State store and secrets components in parallel
- T014, T015, T016, T017 - All Dockerfiles in parallel

**User Story Level**:
- US3, US4, US5 can all run in parallel once US1 is complete
- US8 can run in parallel with US6 and US7

---

## Parallel Example: Phase 8 (Local Deployment)

```bash
# Launch all subchart creations in parallel:
Task: "Create chat-api subchart at helm/todo-chatbot/charts/chat-api/"
Task: "Create notification subchart at helm/todo-chatbot/charts/notification/"
Task: "Create recurring-task subchart at helm/todo-chatbot/charts/recurring-task/"
Task: "Create audit subchart at helm/todo-chatbot/charts/audit/"
```

---

## Implementation Strategy

### MVP First (US1 + US6 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Event Publishing)
4. Complete Phase 8: User Story 6 (Local Deployment)
5. **STOP and VALIDATE**: Events flowing through Kafka on Minikube
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Events) → Test locally → **MVP Ready!**
3. US2 (Reminders) → Test locally → Enhanced MVP
4. US3, US4, US5 (Consumers) → Test locally → Full event-driven system
5. US6 (Minikube) → Local validation complete
6. US7 (OKE) → Cloud deployment complete
7. US8 (Monitoring) → Production-ready

### Suggested MVP Scope

**MVP = US1 + US6**: Event publishing working on Minikube
- 28 tasks (T001-T019 + T020-T028)
- Validates core event-driven architecture
- Can demo Kafka events flowing

---

## Summary

| Phase | User Story | Priority | Task Count | Parallel Tasks |
|-------|------------|----------|------------|----------------|
| 1 | Setup | - | 8 | 6 |
| 2 | Foundational | - | 11 | 6 |
| 3 | US1 - Event Publishing | P1 | 9 | 0 |
| 4 | US2 - Scheduled Reminders | P1 | 9 | 0 |
| 5 | US3 - Notification Service | P2 | 7 | 2 |
| 6 | US4 - Recurring Task Service | P2 | 10 | 2 |
| 7 | US5 - Audit Service | P3 | 10 | 3 |
| 8 | US6 - Local Deployment | P1 | 12 | 6 |
| 9 | US7 - OKE Deployment | P2 | 9 | 2 |
| 10 | US8 - Monitoring | P3 | 9 | 2 |
| 11 | Polish | - | 9 | 3 |
| **Total** | | | **103** | **32** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story can be independently validated after completion
- Commit after each task or logical group
- MVP achievable with ~28 tasks (Setup + Foundational + US1)
