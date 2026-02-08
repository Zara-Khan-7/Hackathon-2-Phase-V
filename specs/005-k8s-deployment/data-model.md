# Data Model: Kubernetes Resources for Todo Chatbot

**Feature**: 005-k8s-deployment
**Date**: 2026-01-23

## Overview

This document defines the Kubernetes resource model for deploying the Phase III Todo Chatbot. Unlike traditional data models, these are infrastructure resources that describe the desired state of the deployment.

## Resource Entities

### 1. Container Image

**Purpose**: Packaged application artifact for deployment

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| name | string | Image name (e.g., `todo-chatbot-backend`) | Required, lowercase, alphanumeric with hyphens |
| tag | string | Semantic version (e.g., `1.0.0`) | Required, semver format |
| registry | string | Container registry (e.g., `docker.io/user`) | Optional, defaults to local |
| size | number | Image size in MB | Must be <500MB (frontend), <200MB (backend) |

**Relationships**:
- Referenced by: Deployment (spec.containers[].image)

### 2. Helm Chart

**Purpose**: Package of Kubernetes manifest templates

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| name | string | Chart name (e.g., `backend`, `frontend`) | Required, lowercase |
| version | string | Chart version (e.g., `0.1.0`) | Required, semver format |
| appVersion | string | Application version | Required, matches container tag |
| dependencies | array | Chart dependencies | Optional |

**File Structure**:
```
chart-name/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration
├── values.schema.json  # Values validation schema
├── templates/          # Kubernetes manifest templates
│   ├── _helpers.tpl    # Template helpers
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── NOTES.txt       # Post-install notes
└── .helmignore         # Files to ignore
```

### 3. Deployment

**Purpose**: Declares desired pod state and replica count

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| replicas | integer | Number of pod replicas | Min: 1, Default: 2 |
| image | string | Container image reference | Required |
| port | integer | Container port | Required, 1-65535 |
| resources.requests.cpu | string | CPU request | Default: 100m |
| resources.requests.memory | string | Memory request | Default: 128Mi |
| resources.limits.cpu | string | CPU limit | Default: 500m |
| resources.limits.memory | string | Memory limit | Default: 512Mi |
| livenessProbe | object | Health check configuration | Required |
| readinessProbe | object | Ready check configuration | Required |

**State Transitions**:
```
Pending → ContainerCreating → Running → Terminating → Terminated
                    ↓
              CrashLoopBackOff (on failure)
```

### 4. Service

**Purpose**: Stable network endpoint for pod access

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| name | string | Service name | Required, DNS-compatible |
| type | enum | Service type | ClusterIP, NodePort, LoadBalancer |
| port | integer | Service port | Required, 1-65535 |
| targetPort | integer | Container port | Required, matches Deployment port |
| nodePort | integer | External port (NodePort only) | 30000-32767 |

**Backend Service**:
- Type: ClusterIP (internal only)
- Port: 8000
- Selector: app=backend

**Frontend Service**:
- Type: NodePort (external access)
- Port: 3000
- NodePort: 30080 (configurable)
- Selector: app=frontend

### 5. ConfigMap

**Purpose**: Non-secret configuration data

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| name | string | ConfigMap name | Required |
| data | map | Key-value configuration | Required |

**Backend ConfigMap**:
```yaml
CORS_ORIGINS: "http://localhost:30080,http://minikube-ip:30080"
LOG_LEVEL: "INFO"
```

**Frontend ConfigMap**:
```yaml
NEXT_PUBLIC_API_URL: "http://backend-service:8000"
```

### 6. Secret

**Purpose**: Sensitive configuration data (base64 encoded)

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| name | string | Secret name | Required |
| type | enum | Secret type | Opaque (default) |
| data | map | Base64-encoded key-value pairs | Required |

**Backend Secrets**:
```yaml
DATABASE_URL: <base64-encoded-neon-url>
JWT_SECRET: <base64-encoded-secret>
GROQ_API_KEY: <base64-encoded-api-key>
```

**Frontend Secrets** (if needed):
```yaml
BETTER_AUTH_SECRET: <base64-encoded-secret>
DATABASE_URL: <base64-encoded-neon-url>
```

### 7. Ingress (Optional)

**Purpose**: HTTP/HTTPS routing from external traffic

| Attribute | Type | Description | Validation |
|-----------|------|-------------|------------|
| host | string | Hostname for routing | Optional, defaults to * |
| path | string | URL path | Default: / |
| pathType | enum | Path matching type | Prefix, Exact, ImplementationSpecific |
| backend.service | string | Target service name | Required |
| backend.port | integer | Target service port | Required |

**Configuration**:
```yaml
rules:
  - host: todo-chatbot.local
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: frontend
              port:
                number: 3000
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: backend
              port:
                number: 8000
```

## Resource Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      Helm Chart                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Deployment                        │    │
│  │  ┌─────────────┐    ┌─────────────┐                 │    │
│  │  │   Pod 1     │    │   Pod 2     │                 │    │
│  │  │ ┌─────────┐ │    │ ┌─────────┐ │                 │    │
│  │  │ │Container│ │    │ │Container│ │                 │    │
│  │  │ └────┬────┘ │    │ └────┬────┘ │                 │    │
│  │  └──────┼──────┘    └──────┼──────┘                 │    │
│  │         │                  │                         │    │
│  │  ┌──────▼──────────────────▼──────┐                 │    │
│  │  │           Service              │                 │    │
│  │  │    (ClusterIP / NodePort)      │                 │    │
│  │  └────────────────────────────────┘                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │  ConfigMap          │          Secret               │    │
│  │  (env vars)         │    (credentials, keys)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Ingress (Optional)    │
              │  (external routing)     │
              └─────────────────────────┘
```

## Validation Rules

### Deployment Validations
- At least 1 replica required
- Container image must be pullable
- Resource limits must be >= requests
- Probes must have valid paths and ports

### Service Validations
- NodePort must be in range 30000-32767
- Selector must match Deployment labels
- Port must match container targetPort

### Secret Validations
- All values must be base64 encoded
- Required secrets must be present before deployment
- No secrets in ConfigMaps

## Environment-Specific Overrides

| Setting | Local (Minikube) | Production |
|---------|------------------|------------|
| replicas | 2 | 3+ |
| resources.limits.memory | 512Mi | 1Gi |
| service.type | NodePort | LoadBalancer |
| ingress.enabled | false | true |
| ingress.tls | false | true |
