---
id: 004
title: Phase V Event-Driven Cloud Constitution
stage: constitution
date: 2026-02-08
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: user
command: /sp.constitution
labels: ["event-driven", "kafka", "dapr", "kubernetes", "cloud-native", "microservices", "aks", "gke", "oke"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document, no tests)
---

## Prompt

```text
Project: Advanced Cloud Deployment for Event-Driven Todo Chatbot
Core principles:

Adherence to Agentic Dev Stack workflow: Every development step must follow Write spec → Generate plan → Break into tasks → Implement via Claude Code; no manual coding permitted
Integration of advanced features with event-driven architecture using Kafka (or alternative Pub/Sub like Redpanda) and full Dapr runtime for decoupling and scalability
Dual deployment strategy: Local testing on Minikube first, followed by production-grade cloud deployment on Azure AKS, Google GKE, or Oracle OKE
Emphasis on loose coupling, real-time capabilities, and microservices best practices for reminders, recurring tasks, audit logs, and client sync
Use of open-source and free-tier services where possible (e.g., Redpanda Cloud free tier, Oracle Always Free, self-hosted Strimzi for Kafka) to minimize costs and enhance learning

Key standards:

All implementations must incorporate Dapr building blocks: Pub/Sub (for Kafka abstraction), State Management (for conversation and task state), Service Invocation (for inter-service communication), Bindings (e.g., cron for scheduling), Secrets Management (using Kubernetes secrets or Dapr API), and Jobs API (for precise reminder scheduling over polling)
Features must include all Advanced Level (Recurring Tasks, Due Dates & Reminders) and Intermediate Level (Priorities, Tags, Search, Filter, Sort), integrated with Kafka topics (task-events, reminders, task-updates) and event schemas as specified
Deployment artifacts (e.g., Helm charts from Phase IV, YAML configs, Dockerfiles) must be reusable, version-controlled, and deployable via CI/CD with GitHub Actions
Monitoring and logging configured using standard Kubernetes tools (e.g., Prometheus, Grafana, ELK stack) or cloud-native equivalents
Code and configs generated exclusively via SpecifyPlus and Claude; all prompts, iterations, and reviews documented for judging
Architecture alignment: Chat API as producer, separate services (Notification, Recurring Task, Audit) as consumers; external Neon DB for state; real-time sync via WebSocket

Constraints:

No manual coding or direct edits; all code must originate from Claude-generated outputs based on specs and tasks
Cloud setup limited to free tiers/credits: Azure ($200/30 days), Oracle (Always Free OKE), Google ($300/90 days); fallback to self-hosted Kafka via Strimzi if managed service access issues
Local deployment: Minikube with full Dapr and Redpanda Docker for Kafka simulation
Cloud deployment: AKS/GKE/OKE with full Dapr, managed or self-hosted Kafka/Redpanda, CI/CD pipeline, monitoring/logging
Event-driven focus: No tight coupling; all inter-service communication via Kafka events, not direct API calls
Documentation: Include setup guides, component YAMLs, Python client examples (using Dapr HTTP APIs), and architecture diagrams in final outputs

Success criteria:

Successful local deployment on Minikube: All features operational, Dapr sidecars running, Kafka topics handling events without errors
Successful cloud deployment to AKS/GKE/OKE with full Dapr, managed or self-hosted Kafka, CI/CD pipeline, monitoring/logging
```

## Response snapshot

Created Phase V constitution (version 2.0.0) with 7 core principles for advanced event-driven cloud deployment:

1. **I. Agentic Dev Stack Workflow** - Strict spec-driven development via Claude Code, no manual coding
2. **II. Event-Driven Microservices Architecture** - Kafka-based async communication, loose coupling
3. **III. Dapr-Native Runtime Integration** - Full Dapr building blocks (Pub/Sub, State, Bindings, Jobs API, Secrets)
4. **IV. Dual Deployment Strategy** - Minikube local → AKS/GKE/OKE cloud deployment sequence
5. **V. Kafka-Centric Event Messaging** - Defined topics (task-events, reminders, task-updates, recurring-tasks)
6. **VI. Cost-Optimized Open Source Stack** - Free-tier cloud constraints, Strimzi fallback
7. **VII. Observability and Monitoring by Default** - Prometheus, Grafana, ELK, structured logging

Added sections for Feature Requirements (Recurring Tasks, Reminders, Priorities, Tags, Search, Filter, Sort), Dapr Building Blocks table, Kafka Topic Architecture, and Cloud Provider Constraints.

Version bumped from 1.0.0 → 2.0.0 (MAJOR) due to architectural paradigm shift from Phase IV container-native to Phase V event-driven microservices.

## Outcome

- ✅ Impact: High - Established foundational principles for Phase V event-driven cloud deployment
- 🧪 Tests: N/A (constitution document)
- 📁 Files: 1 modified (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify for event-driven feature, then /sp.plan, /sp.tasks
- 🧠 Reflection: Constitution captures full scope of Phase V requirements including Dapr, Kafka, dual deployment, and cost constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual review PASS - all placeholders filled, 7 testable principles, no bracket tokens remaining
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution principles during first feature implementation cycle
