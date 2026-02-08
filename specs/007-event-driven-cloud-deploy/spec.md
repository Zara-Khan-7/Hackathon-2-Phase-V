# Feature Specification: Event-Driven Cloud Deployment

**Feature Branch**: `007-event-driven-cloud-deploy`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Phase V - Transform Todo Chatbot into event-driven, production-grade system using Kafka + Dapr, with local Minikube validation and Oracle Cloud OKE deployment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Event-Driven Task Operations (Priority: P1)

As a system operator, I need all task operations (create, update, complete, delete) to publish events to a message broker so that other services can react to changes asynchronously, enabling loose coupling and future extensibility.

**Why this priority**: This is the foundation of the event-driven architecture. Without reliable event publishing, no downstream services (notifications, recurring tasks, audit) can function.

**Independent Test**: Can be fully tested by creating a task and verifying the event appears in the task-events topic with correct schema and data.

**Acceptance Scenarios**:

1. **Given** a user creates a new task, **When** the task is saved to the database, **Then** a `task.created` event is published containing the full task data, user_id, and timestamp
2. **Given** a user updates an existing task, **When** the update is persisted, **Then** a `task.updated` event is published with the updated task data
3. **Given** a user marks a task as complete, **When** the status changes to completed, **Then** a `task.completed` event is published
4. **Given** a user deletes a task, **When** the deletion is processed, **Then** a `task.deleted` event is published with the task_id

---

### User Story 2 - Scheduled Reminder Delivery (Priority: P1)

As a user with tasks that have due dates and reminders, I need the system to schedule a job that triggers at the exact reminder time so that I receive timely notifications without the system constantly polling the database.

**Why this priority**: Reminders are a core user-facing feature. Using scheduled jobs instead of database polling ensures precise timing and efficient resource usage.

**Independent Test**: Can be tested by creating a task with a due date and reminder offset, then verifying a job is scheduled and a reminder event is published at the correct time.

**Acceptance Scenarios**:

1. **Given** a task is created with a due date and reminder_offset_minutes, **When** the task is saved, **Then** a one-time scheduled job is created to fire at the calculated remind_at timestamp
2. **Given** a scheduled reminder job fires, **When** the callback endpoint is invoked, **Then** a reminder event is published to the reminders topic
3. **Given** a task's due date or reminder is updated, **When** the update is saved, **Then** the existing scheduled job is cancelled and a new one is created

---

### User Story 3 - Notification Service Consumer (Priority: P2)

As a system operator, I need a notification service that consumes reminder events so that users can eventually receive push/email notifications (stubbed for now with logging).

**Why this priority**: Demonstrates the consumer side of event-driven architecture. The actual notification delivery is stubbed, but the infrastructure is in place.

**Independent Test**: Can be tested by publishing a reminder event and verifying the notification service logs the "Would send notification" message.

**Acceptance Scenarios**:

1. **Given** a reminder event is published, **When** the notification service receives it, **Then** it logs the reminder details indicating notification would be sent
2. **Given** multiple reminder events in quick succession, **When** the notification service processes them, **Then** each is handled independently without blocking

---

### User Story 4 - Recurring Task Generation (Priority: P2)

As a user with recurring tasks, when I complete a task that has a recurrence rule, I need the system to automatically create the next occurrence so that I don't have to manually recreate repeating tasks.

**Why this priority**: Builds on the event-driven foundation. The recurring task service consumes task.completed events and creates new tasks.

**Independent Test**: Can be tested by completing a recurring task and verifying a new task is created with the next calculated due date.

**Acceptance Scenarios**:

1. **Given** a recurring task is marked complete, **When** the recurring task service receives the task.completed event, **Then** it calculates the next due date based on recurrence_rule and creates a new task
2. **Given** a non-recurring task is completed, **When** the event is received, **Then** no new task is created

---

### User Story 5 - Audit Trail Service (Priority: P3)

As a system administrator, I need all task events to be logged for audit purposes so that I can trace the history of all task operations.

**Why this priority**: Important for compliance and debugging, but not critical for core functionality.

**Independent Test**: Can be tested by performing task operations and verifying audit entries are stored.

**Acceptance Scenarios**:

1. **Given** any task event is published, **When** the audit service receives it, **Then** an audit log entry is created with event type, task_id, user_id, and timestamp
2. **Given** multiple task events occur, **When** querying the audit log, **Then** all events are recorded in chronological order

---

### User Story 6 - Local Development Deployment (Priority: P1)

As a developer, I need to deploy the complete event-driven system locally using Minikube so that I can validate the architecture before cloud deployment.

**Why this priority**: Essential for development and testing. Must work locally before deploying to cloud.

**Independent Test**: Can be tested by deploying to Minikube and performing end-to-end task operations with event verification.

**Acceptance Scenarios**:

1. **Given** Minikube is running with Dapr installed, **When** deploying the application stack, **Then** all services start with Dapr sidecars attached
2. **Given** a local Kafka/Redpanda instance is running, **When** task operations are performed, **Then** events flow through the message broker to consumers
3. **Given** the local environment is running, **When** creating a task with reminder, **Then** the job is scheduled and fires at the correct time

---

### User Story 7 - Cloud Deployment to Oracle OKE (Priority: P2)

As a DevOps engineer, I need to deploy the system to Oracle Cloud OKE (Always Free tier) so that the application runs in a production-grade Kubernetes environment.

**Why this priority**: The ultimate goal of this phase, but depends on local validation being complete first.

**Independent Test**: Can be tested by deploying to OKE and running the same validation suite as local deployment.

**Acceptance Scenarios**:

1. **Given** OKE cluster is provisioned with Dapr installed, **When** deploying via Helm charts, **Then** all services deploy successfully with correct configurations
2. **Given** Kafka is running in the cluster (Strimzi or Redpanda Cloud), **When** task operations are performed, **Then** events flow correctly in the cloud environment
3. **Given** GitHub Actions CI/CD pipeline is configured, **When** code is pushed to main branch, **Then** images are built, pushed, and deployed to OKE

---

### User Story 8 - Observability and Monitoring (Priority: P3)

As a system operator, I need monitoring and logging infrastructure so that I can observe system health and troubleshoot issues.

**Why this priority**: Important for production operations but not blocking for core functionality.

**Independent Test**: Can be tested by deploying monitoring stack and verifying metrics/logs are collected.

**Acceptance Scenarios**:

1. **Given** Prometheus and Grafana are deployed, **When** viewing dashboards, **Then** service metrics are visible including request rates and error counts
2. **Given** structured logging is configured, **When** services emit logs, **Then** logs are aggregated and searchable

---

### Edge Cases

- What happens when the message broker is temporarily unavailable? Events should be retried with exponential backoff.
- What happens when a scheduled reminder job fails to execute? The job should be retried according to Dapr scheduler policies.
- What happens when the recurring task service fails to create a new task? The event should be retried or moved to a dead-letter queue.
- How does the system handle duplicate events? Consumers should be idempotent to handle at-least-once delivery.
- What happens if a task is deleted before its scheduled reminder fires? The scheduled job should be cancelled.

## Requirements *(mandatory)*

### Functional Requirements

**Event Publishing (Producer Side)**

- **FR-001**: System MUST publish a `task.created` event to the task-events topic when a new task is created
- **FR-002**: System MUST publish a `task.updated` event when any task field is modified
- **FR-003**: System MUST publish a `task.completed` event when a task status changes to completed
- **FR-004**: System MUST publish a `task.deleted` event when a task is removed
- **FR-005**: All events MUST include event_type, task_id, task_data (full object), user_id, and ISO timestamp
- **FR-006**: System MUST publish reminder events to the reminders topic containing task_id, title, due_at, remind_at, and user_id

**Scheduled Jobs for Reminders**

- **FR-007**: System MUST schedule a one-time job using Dapr Jobs API when a task with reminder is created/updated
- **FR-008**: System MUST cancel existing scheduled jobs when a task's reminder is modified or task is deleted
- **FR-009**: Job callback endpoint MUST publish a reminder event when invoked at the scheduled time

**Consumer Services**

- **FR-010**: Notification service MUST subscribe to reminders topic and log notification details
- **FR-011**: Recurring task service MUST subscribe to task-events topic and filter for completed recurring tasks
- **FR-012**: Recurring task service MUST calculate next due date based on recurrence_rule and create new task
- **FR-013**: Audit service MUST subscribe to task-events topic and store all events in an audit log

**Dapr Integration**

- **FR-014**: All inter-service communication MUST use Dapr building blocks (Pub/Sub, Service Invocation, Secrets, State)
- **FR-015**: Application code MUST NOT contain direct Kafka client libraries or hardcoded service URLs
- **FR-016**: Secrets (database credentials, API keys) MUST be retrieved via Dapr Secrets Store

**Deployment**

- **FR-017**: System MUST be deployable to local Minikube with Dapr and Kafka/Redpanda
- **FR-018**: System MUST be deployable to Oracle Cloud OKE using Helm charts
- **FR-019**: CI/CD pipeline MUST automate building, testing, and deploying to OKE

### Key Entities

- **Task Event**: Represents any change to a task (created, updated, completed, deleted). Contains event metadata and full task payload.
- **Reminder Event**: Represents a scheduled reminder notification. Contains task reference and timing information.
- **Audit Log Entry**: Immutable record of a task event for compliance and debugging purposes.
- **Scheduled Job**: Represents a one-time scheduled execution for reminder delivery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All task CRUD operations publish events within 100ms of database commit
- **SC-002**: Scheduled reminders fire within 5 seconds of their scheduled time
- **SC-003**: Consumer services process events within 1 second of publication
- **SC-004**: System maintains event delivery guarantees during component restarts
- **SC-005**: Local Minikube deployment completes in under 10 minutes from fresh start
- **SC-006**: Cloud deployment via CI/CD pipeline completes in under 15 minutes
- **SC-007**: Zero direct Kafka dependencies in application code (all via Dapr abstraction)
- **SC-008**: All services run within Oracle Cloud Always Free tier resource limits
- **SC-009**: System handles 100 concurrent task operations without event loss
- **SC-010**: Monitoring dashboards display real-time metrics with less than 30-second lag

## Assumptions

- Oracle Cloud Always Free OKE cluster is available with 4 OCPUs and 24GB RAM
- Neon PostgreSQL (external database) continues to be used for primary data storage
- Strimzi operator is preferred for Kafka in Kubernetes; Redpanda Cloud is fallback
- Dapr v1.12+ is used for all runtime features including Jobs API
- Existing task features (tags, priorities, recurring, reminders) are fully implemented
- GitHub Actions is used for CI/CD with access to OKE cluster credentials

## Out of Scope

- Actual push notification or email delivery (stubbed with logging)
- WebSocket real-time updates (task-updates topic prepares infrastructure only)
- Multi-region deployment or disaster recovery
- Advanced Kafka features (partitioning strategies, exactly-once semantics)
- Cost optimization beyond staying within free tier limits
