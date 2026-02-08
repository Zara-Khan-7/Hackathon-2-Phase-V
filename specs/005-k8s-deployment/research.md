# Research: Local Kubernetes Deployment of Todo Chatbot

**Feature**: 005-k8s-deployment
**Date**: 2026-01-23
**Status**: Complete

## Research Areas

### 1. Docker Multi-Stage Build Patterns

**Decision**: Use multi-stage builds with specific base images per application type.

**Rationale**:
- Multi-stage builds reduce final image size by separating build dependencies from runtime
- Python backend: Use `python:3.11-slim` for runtime (smaller than Alpine due to compatibility)
- Next.js frontend: Use `node:18-alpine` for build, `node:18-alpine` for runtime with standalone output

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Single-stage build | Includes build tools in final image, larger size |
| Distroless images | Limited debugging capability, added complexity for first deployment |
| Alpine for Python | Potential glibc compatibility issues with some packages |

**Best Practices Applied**:
- Copy only necessary files (requirements.txt, package.json first for layer caching)
- Use `.dockerignore` to exclude node_modules, __pycache__, .git
- Set non-root user for security
- Use HEALTHCHECK instruction in Dockerfile

### 2. Helm Chart Structure for Web Applications

**Decision**: Separate charts for frontend and backend, standard Helm 3 structure.

**Rationale**:
- Independent versioning allows backend to update without touching frontend
- Standard structure (Chart.yaml, values.yaml, templates/) is widely understood
- Values schema enables IDE autocomplete and validation

**Chart Components**:

| Resource | Backend | Frontend |
|----------|---------|----------|
| Deployment | ✅ | ✅ |
| Service | ✅ ClusterIP | ✅ NodePort |
| ConfigMap | ✅ Non-secret config | ✅ API URL |
| Secret | ✅ DB URL, API keys | ❌ No secrets |
| Ingress | ❌ Optional | ✅ Optional |
| HPA | ❌ Not for local | ❌ Not for local |

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Single umbrella chart | Less flexible, harder to version independently |
| Kustomize | Helm is constitution-mandated, better templating |
| Raw manifests | Prohibited by constitution (Principle III) |

### 3. Minikube Configuration for Local Development

**Decision**: Use Minikube with Docker driver, enable ingress addon.

**Rationale**:
- Docker driver works seamlessly on Windows with Docker Desktop
- Ingress addon provides realistic routing for frontend access
- Single-node sufficient for development/testing purposes

**Configuration**:
```bash
# Recommended Minikube settings
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable ingress
minikube addons enable metrics-server  # For Kagent analysis
```

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Kind (Kubernetes in Docker) | Less tooling support, no built-in addons |
| k3d | More complex setup on Windows |
| Docker Desktop Kubernetes | Less control over cluster lifecycle |

### 4. kubectl-ai Integration Patterns

**Decision**: Use kubectl-ai for resource creation, debugging, and log analysis.

**Rationale**:
- Natural language interface reduces kubectl command memorization
- AI suggestions catch common misconfigurations
- Aligns with constitution Principle IV (AI-Assisted Operations)

**Usage Patterns**:
```bash
# Deployment via kubectl-ai
kubectl-ai "deploy the backend helm chart with 2 replicas"
kubectl-ai "show me pods that are not running"
kubectl-ai "get logs from the backend pods with errors"
kubectl-ai "describe the failing pod and suggest fixes"
```

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Raw kubectl | Manual, error-prone, not AI-first |
| k9s | Great for monitoring but not AI-assisted |
| Lens | GUI-based, not command-line AI-first |

### 5. Kagent Cluster Optimization

**Decision**: Use Kagent for resource analysis and optimization suggestions.

**Rationale**:
- Kagent provides AI-powered cluster health analysis
- Identifies resource over/under-provisioning
- Suggests optimizations for pod scheduling

**Integration Points**:
- Post-deployment analysis: Check resource utilization
- Troubleshooting: Diagnose unhealthy pods
- Optimization: Right-size resource requests/limits

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Manual kubectl describe | Not AI-assisted |
| Prometheus + Grafana | Overkill for local dev, complex setup |
| Kubernetes Dashboard | GUI-based, limited AI suggestions |

### 6. Secret Management in Kubernetes

**Decision**: Use Kubernetes Secrets with values injected via Helm.

**Rationale**:
- Secrets separated from application code and manifests
- Base64 encoding (not encryption, but better than plaintext in ConfigMaps)
- Helm templating allows different secrets per environment

**Secret Structure**:
```yaml
# Backend secrets
DATABASE_URL: <neon-connection-string>
JWT_SECRET: <auth-secret>
GROQ_API_KEY: <groq-key>

# Frontend secrets (if any)
BETTER_AUTH_SECRET: <auth-secret>
```

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Environment variables in Deployment | Visible in manifest, less secure |
| External Secrets Operator | Overkill for local development |
| HashiCorp Vault | Complex setup, not needed for local |

### 7. Health Check Endpoints

**Decision**: Leverage existing health endpoints, add if missing.

**Rationale**:
- FastAPI backend likely has `/health` endpoint (common pattern)
- Next.js can use `/api/health` or root path for readiness

**Probe Configuration**:
```yaml
# Backend
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10

# Frontend
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
```

## Resolved Clarifications

No NEEDS CLARIFICATION items from Technical Context - all requirements are specified.

## Technology Decisions Summary

| Area | Decision | Key Tool |
|------|----------|----------|
| Container Building | Multi-stage builds with slim/alpine bases | Gordon/Docker AI |
| Orchestration | Separate Helm charts per service | Helm 3.x |
| Local Cluster | Minikube with Docker driver | Minikube 1.30+ |
| Deployment | Natural language AI-assisted | kubectl-ai |
| Optimization | Cluster health analysis | Kagent |
| Secrets | Kubernetes Secrets via Helm values | kubectl/Helm |
| Health Checks | HTTP probes on /health endpoints | Kubernetes native |

## Next Steps

1. Proceed to Phase 1: Design & Contracts
2. Generate data-model.md with Kubernetes resource specifications
3. Create contracts/ with Helm values schema
4. Write quickstart.md with deployment instructions
