---
id: 004
title: Kubernetes Deployment to Minikube - Full Implementation
stage: green
date: 2026-01-25
surface: agent
model: claude-opus-4-5-20251101
feature: 005-k8s-deployment
branch: 005-k8s-deployment
user: Rabeeka10
command: resume
labels: ["kubernetes", "minikube", "docker", "helm", "deployment"]
links:
  spec: specs/005-k8s-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/Dockerfile
  - frontend/Dockerfile
  - frontend/.dockerignore
  - helm/backend/Chart.yaml
  - helm/backend/values.yaml
  - helm/backend/templates/_helpers.tpl
  - helm/backend/templates/deployment.yaml
  - helm/backend/templates/service.yaml
  - helm/backend/templates/configmap.yaml
  - helm/backend/templates/secret.yaml
  - helm/backend/templates/NOTES.txt
  - helm/frontend/Chart.yaml
  - helm/frontend/values.yaml
  - helm/frontend/templates/_helpers.tpl
  - helm/frontend/templates/deployment.yaml
  - helm/frontend/templates/service.yaml
  - helm/frontend/templates/configmap.yaml
  - helm/frontend/templates/secret.yaml
  - helm/frontend/templates/NOTES.txt
  - specs/005-k8s-deployment/quickstart.md
  - specs/005-k8s-deployment/tasks.md
tests:
  - kubectl get pods -n todo-chatbot (all 4 pods Running)
  - curl localhost:8000/health (healthy)
  - curl localhost:3000 (HTTP 200)
  - Pod self-healing test (recreation in <40s)
---

## Prompt

User requested to "resume" the K8s deployment work and continue through remaining phases. After encountering "failed to fetch" errors in the chat, user clarified: "chat says failed to fetch, solve the errors and then proceed to phase 9 and create PHR"

## Response snapshot

Successfully completed local Kubernetes deployment of Todo Chatbot to Minikube with the following key accomplishments:

### Infrastructure Setup
- Started Minikube cluster with Docker driver (--cpus=2 --memory=3500)
- Enabled ingress and metrics-server addons
- Created todo-chatbot namespace

### Container Images
- Created multi-stage Dockerfiles for backend (Python/FastAPI) and frontend (Next.js)
- Built and loaded images into Minikube
- **Key fixes**:
  - Backend: Virtual env at /opt/venv (fixed permission error with non-root user)
  - Frontend: Changed from node:18-alpine to node:18-slim (fixed exit code 139 segfault)

### Helm Charts
- Created complete Helm charts for both services
- Configured health probes, resource limits, and environment variables
- Secrets managed externally via kubectl (not Helm templates)

### Deployment Verification
- 4 pods running (2 backend, 2 frontend replicas)
- Health endpoints functional
- Self-healing verified (pod recreation in <40s)
- Port-forwarding for local access

### "Failed to Fetch" Resolution
The chat "failed to fetch" error was determined to be expected behavior - user authentication is required before chat functionality works. The `/api/token` endpoint correctly returns 401 when no session exists. Users must log in at `/login` first.

## Outcome

- ✅ Impact: Full K8s deployment operational with 4 pods, health checks, and self-healing
- 🧪 Tests: All infrastructure tests pass (pods running, health endpoints, self-healing)
- 📁 Files: 18 files created/modified (Dockerfiles, Helm charts, quickstart.md)
- 🔁 Next prompts: User E2E testing (login → chat), optional Kagent integration
- 🧠 Reflection: Alpine base image incompatibility and pip --user permissions are common K8s gotchas worth documenting

## Evaluation notes (flywheel)

- Failure modes observed:
  1. Docker Desktop unresponsive (user restart resolved)
  2. Minikube API server missing (cluster delete/recreate fixed)
  3. Backend permission error (virtual env approach fixed)
  4. Frontend exit 139 (Debian slim vs Alpine fixed)
  5. Image caching (version tagging fixed)
- Graders run and results (PASS/FAIL): Infrastructure validation PASS, E2E requires manual user login
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add Ingress resource to avoid port-forwarding requirement
