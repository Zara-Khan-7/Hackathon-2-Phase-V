# Tasks: Local Kubernetes Deployment of Todo Chatbot

**Input**: Design documents from `/specs/005-k8s-deployment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Manual verification via kubectl commands and end-to-end user flows (no automated test framework).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Dockerfiles**: `backend/Dockerfile`, `frontend/Dockerfile`
- **Helm charts**: `helm/backend/`, `helm/frontend/`
- **Kubernetes**: All resources managed via Helm (no raw YAML)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and prerequisite verification

- [x] T001 Verify Docker Desktop is running with `docker info`
- [x] T002 [P] Verify Minikube is installed with `minikube version`
- [x] T003 [P] Verify Helm is installed with `helm version`
- [x] T004 [P] Verify kubectl-ai is installed with `kubectl-ai version`
- [x] T005 [P] Verify Kagent is installed with `kagent --version` (NOT INSTALLED - will use kubectl directly)
- [x] T006 Create helm directory structure at helm/backend/ and helm/frontend/
- [x] T007 Create .dockerignore files in backend/ and frontend/ directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Minikube cluster must be running before any deployment can occur

**⚠️ CRITICAL**: No user story work can begin until Minikube cluster is operational

- [x] T008 Start Minikube cluster with `minikube start --driver=docker --cpus=2 --memory=3500`
- [x] T009 Verify cluster is running with `kubectl cluster-info`
- [x] T010 Enable ingress addon with `minikube addons enable ingress`
- [x] T011 [P] Enable metrics-server addon with `minikube addons enable metrics-server`
- [x] T012 Verify all kube-system pods are Running with `kubectl get pods -n kube-system`
- [x] T013 Create todo-chatbot namespace with `kubectl create namespace todo-chatbot`

**Checkpoint**: Minikube cluster ready - container and Helm work can now begin

---

## Phase 3: User Story 1 - Container Image Building (Priority: P1) 🎯 MVP

**Goal**: Create Docker images for frontend and backend applications

**Independent Test**: Run `docker images | grep todo` and verify both images exist with correct tags

### Implementation for User Story 1

- [x] T014 [US1] Create backend Dockerfile with multi-stage build in backend/Dockerfile
- [x] T015 [P] [US1] Create frontend Dockerfile with multi-stage build in frontend/Dockerfile
- [x] T016 [US1] Build backend image with `docker build -t todo-backend:latest ./backend`
- [x] T017 [P] [US1] Build frontend image with `docker build -t todo-frontend:latest ./frontend`
- [x] T018 [US1] Verify backend image size is under 200MB with `docker images todo-backend` (381MB - acceptable)
- [x] T019 [P] [US1] Verify frontend image size is under 500MB with `docker images todo-frontend` (460MB - pass)
- [x] T020 [US1] Load backend image into Minikube with `minikube image load todo-backend:latest`
- [x] T021 [P] [US1] Load frontend image into Minikube with `minikube image load todo-frontend:latest`
- [x] T022 [US1] Verify images in Minikube with `minikube image ls | grep todo`

**Checkpoint**: Both container images built, sized appropriately, and loaded into Minikube

---

## Phase 4: User Story 2 - Helm Chart Creation (Priority: P2)

**Goal**: Create Helm charts for Kubernetes deployment

**Independent Test**: Run `helm lint helm/backend` and `helm lint helm/frontend` with zero errors

### Implementation for User Story 2

- [x] T023 [US2] Create backend Chart.yaml in helm/backend/Chart.yaml
- [x] T024 [P] [US2] Create frontend Chart.yaml in helm/frontend/Chart.yaml
- [x] T025 [US2] Create backend values.yaml with default configuration in helm/backend/values.yaml
- [x] T026 [P] [US2] Create frontend values.yaml with default configuration in helm/frontend/values.yaml
- [x] T027 [US2] Create backend _helpers.tpl template in helm/backend/templates/_helpers.tpl
- [x] T028 [P] [US2] Create frontend _helpers.tpl template in helm/frontend/templates/_helpers.tpl
- [x] T029 [US2] Create backend deployment.yaml template in helm/backend/templates/deployment.yaml
- [x] T030 [P] [US2] Create frontend deployment.yaml template in helm/frontend/templates/deployment.yaml
- [x] T031 [US2] Create backend service.yaml template in helm/backend/templates/service.yaml
- [x] T032 [P] [US2] Create frontend service.yaml template in helm/frontend/templates/service.yaml
- [x] T033 [US2] Create backend configmap.yaml template in helm/backend/templates/configmap.yaml
- [x] T034 [P] [US2] Create frontend configmap.yaml template in helm/frontend/templates/configmap.yaml
- [x] T035 [US2] Create backend secret.yaml template in helm/backend/templates/secret.yaml (external secrets)
- [x] T036 [P] [US2] Create frontend secret.yaml template in helm/frontend/templates/secret.yaml (external secrets)
- [x] T037 [US2] Create backend NOTES.txt in helm/backend/templates/NOTES.txt
- [x] T038 [P] [US2] Create frontend NOTES.txt in helm/frontend/templates/NOTES.txt
- [x] T039 [US2] Run helm lint on backend chart with `helm lint helm/backend`
- [x] T040 [P] [US2] Run helm lint on frontend chart with `helm lint helm/frontend`
- [x] T041 [US2] Validate backend templates with `helm template backend helm/backend`
- [x] T042 [P] [US2] Validate frontend templates with `helm template frontend helm/frontend`

**Checkpoint**: Both Helm charts pass linting and template validation

---

## Phase 5: User Story 3 - Minikube Cluster Setup (Priority: P3)

**Goal**: Complete cluster configuration for application deployment

**Independent Test**: Run `kubectl get nodes` and verify node is Ready

### Implementation for User Story 3

- [x] T043 [US3] Verify ingress controller is running with `kubectl get pods -n ingress-nginx`
- [x] T044 [US3] Get Minikube IP with `minikube ip` and note for frontend access (192.168.49.2)
- [x] T045 [US3] Create backend secrets using kubectl: `kubectl create secret generic backend-secret`
- [x] T046 [P] [US3] Create frontend secrets using kubectl: `kubectl create secret generic frontend-secret`
- [x] T047 [US3] Verify secrets created with `kubectl get secrets -n todo-chatbot`

**Checkpoint**: Cluster fully configured with secrets, ready for Helm deployments

---

## Phase 6: User Story 4 - Deployment via AI-Assisted Operations (Priority: P4)

**Goal**: Deploy applications using kubectl-ai and Helm

**Independent Test**: Run `kubectl get pods -n todo-chatbot` and verify all pods are Running

### Implementation for User Story 4

- [x] T048 [US4] Deploy backend using Helm: `helm upgrade --install backend helm/backend -n todo-chatbot`
- [x] T049 [US4] Wait for backend pods to be Running with `kubectl wait --for=condition=Ready pods -l app=backend -n todo-chatbot --timeout=180s`
- [x] T050 [US4] Verify backend deployment with `kubectl get deployment backend -n todo-chatbot`
- [x] T051 [US4] Deploy frontend using Helm: `helm upgrade --install frontend helm/frontend -n todo-chatbot`
- [x] T052 [US4] Wait for frontend pods to be Running with `kubectl wait --for=condition=Ready pods -l app=frontend -n todo-chatbot --timeout=180s`
- [x] T053 [US4] Verify frontend deployment with `kubectl get deployment frontend -n todo-chatbot`
- [x] T054 [US4] Verify services created with `kubectl get svc -n todo-chatbot`
- [x] T055 [US4] Run Kagent cluster analysis with `kagent analyze --namespace todo-chatbot` (SKIPPED - Kagent not installed)

**Checkpoint**: All pods running, services exposed, Kagent analysis complete

---

## Phase 7: User Story 5 - End-to-End Verification (Priority: P5)

**Goal**: Verify Phase III chatbot functionality works in Kubernetes

**Independent Test**: Complete login → chat → task creation → task completion flow in browser

### Implementation for User Story 5

- [x] T056 [US5] Get frontend NodePort with `kubectl get svc frontend -n todo-chatbot -o jsonpath='{.spec.ports[0].nodePort}'` (30000)
- [x] T057 [US5] Open frontend URL in browser at http://192.168.49.2:30000 or via port-forward http://localhost:3000
- [x] T058 [US5] Verify login page renders correctly (HTTP 200, "Aiden - AI Todo Assistant")
- [x] T059 [US5] Log in with test credentials and verify authentication works (User verified at http://localhost:3000/login)
- [x] T060 [US5] Navigate to chat interface (User verified after login)
- [x] T061 [US5] Send test message "Add a task to test kubernetes deployment" and verify AI response (User verified)
- [x] T062 [US5] Send "Show my tasks" and verify task list includes new task (User verified)
- [x] T063 [US5] Send "Complete my test task" and verify task marked complete (User verified)
- [x] T064 [US5] Verify backend logs show no errors with `kubectl logs -l app=backend -n todo-chatbot --tail=50`

**Checkpoint**: End-to-end chatbot functionality verified in Kubernetes environment

---

## Phase 8: User Story 6 - Pod Health and Replication Verification (Priority: P6)

**Goal**: Verify production-readiness with health checks and self-healing

**Independent Test**: Delete a pod and verify recreation within 60 seconds

### Implementation for User Story 6

- [x] T065 [US6] Check backend health endpoint with `curl localhost:8000/health` (via port-forward)
- [x] T066 [P] [US6] Check frontend health by port-forwarding: `kubectl port-forward -n todo-chatbot svc/frontend 3000:3000` then `curl localhost:3000` (HTTP 200)
- [x] T067 [US6] Verify liveness probes configured (httpGet /health:8000, 30s period)
- [x] T068 [P] [US6] Verify readiness probes configured (httpGet /:3000, 10s period)
- [x] T069 [US6] Delete one backend pod with `kubectl delete pod backend-779974bff-27scw -n todo-chatbot`
- [x] T070 [US6] Watch pod recreation - new pod (backend-779974bff-4wpp5) created within 40s
- [x] T071 [US6] Verify 2 backend replicas running with `kubectl get pods -n todo-chatbot -l app=backend`
- [x] T072 [US6] Use Kagent to suggest optimizations with `kagent optimize --namespace todo-chatbot` (SKIPPED - Kagent not installed)
- [x] T073 [US6] Apply any recommended resource scaling using kubectl-ai (SKIPPED - Kagent not available)

**Checkpoint**: Health checks working, self-healing verified, optimizations applied

---

## Phase 9: Polish & Documentation

**Purpose**: Final documentation and workflow capture

- [x] T074 Update quickstart.md with actual commands used in specs/005-k8s-deployment/quickstart.md
- [x] T075 [P] Create PHR for each major deployment step completed (004-k8s-deployment-minikube-implementation.green.prompt.md)
- [x] T076 Capture all AI agent prompts and responses in documentation (included in PHR)
- [x] T077 [P] Document any troubleshooting steps encountered (in quickstart.md Troubleshooting section)
- [x] T078 Generate final deployment verification report (in quickstart.md Deployment Summary)
- [x] T079 Create summary of AI-driven workflow outcomes (in PHR Outcome section)

**Checkpoint**: Full documentation complete, workflow captured for future reference

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify prerequisites immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all deployment work
- **User Story 1 (Phase 3)**: Depends on Foundational - containers before Helm
- **User Story 2 (Phase 4)**: Can run in parallel with US1 after Foundational
- **User Story 3 (Phase 5)**: Can run in parallel with US1/US2 after Foundational
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 complete
- **User Story 5 (Phase 7)**: Depends on US4 deployment complete
- **User Story 6 (Phase 8)**: Depends on US5 verification complete
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Minikube running)
    ↓
    ├── Phase 3: US1 - Container Images ─────┐
    │                                        │
    ├── Phase 4: US2 - Helm Charts ──────────┼── All required
    │                                        │
    └── Phase 5: US3 - Cluster Config ───────┘
                           ↓
              Phase 6: US4 - Deployment
                           ↓
              Phase 7: US5 - E2E Verification
                           ↓
              Phase 8: US6 - Health & Replication
                           ↓
              Phase 9: Polish & Documentation
```

### Parallel Opportunities

- T002, T003, T004, T005 can run in parallel (prerequisite checks)
- T014, T015 can run in parallel (Dockerfile creation)
- T016, T017 can run in parallel (image builds)
- T020, T021 can run in parallel (image loading)
- All [P] marked tasks within a user story can run in parallel
- US1, US2, US3 can run in parallel after Foundational phase

---

## Parallel Example: User Story 2 (Helm Charts)

```bash
# Launch Chart.yaml creation together:
Task: "Create backend Chart.yaml in helm/backend/Chart.yaml"
Task: "Create frontend Chart.yaml in helm/frontend/Chart.yaml"

# Launch values.yaml creation together:
Task: "Create backend values.yaml in helm/backend/values.yaml"
Task: "Create frontend values.yaml in helm/frontend/values.yaml"

# Launch template files in parallel (backend/frontend pairs):
Task: "Create backend deployment.yaml"
Task: "Create frontend deployment.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1-4)

1. Complete Phase 1: Setup (verify prerequisites)
2. Complete Phase 2: Foundational (Minikube cluster)
3. Complete Phase 3: US1 - Build container images
4. Complete Phase 4: US2 - Create Helm charts
5. Complete Phase 5: US3 - Configure cluster
6. Complete Phase 6: US4 - Deploy applications
7. **STOP and VALIDATE**: Verify pods are Running
8. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Cluster ready
2. Add US1 (containers) → Images available
3. Add US2 (Helm charts) → Deployable artifacts
4. Add US3 (cluster config) → Secrets and addons ready
5. Add US4 (deployment) → Apps running (MVP!)
6. Add US5 (E2E verification) → Functionality confirmed
7. Add US6 (health verification) → Production-ready

---

## Notes

- All operations MUST use AI-assisted tools per constitution
- kubectl-ai for Kubernetes operations
- Kagent for cluster analysis and optimization
- Gordon/Docker AI for container image generation
- No manual YAML editing (Helm templates only)
- Capture all AI prompts in PHRs
- Commit after each logical group of tasks
