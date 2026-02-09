# Oracle OKE Cluster Provisioning Guide

## Overview

This guide walks through provisioning an Oracle Kubernetes Engine (OKE) cluster using the Always Free tier resources.

## Always Free Tier Resources

| Resource | Allocation |
|----------|------------|
| Compute | 4 OCPUs (Ampere A1) |
| Memory | 24 GB RAM |
| Block Storage | 200 GB |
| Object Storage | 20 GB |
| Load Balancer | 1 (10 Mbps) |

## Prerequisites

1. Oracle Cloud account with Always Free tier
2. OCI CLI installed: `brew install oci-cli` or [manual install](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm)
3. Configure OCI CLI: `oci setup config`

## Step 1: Create Compartment

```bash
# Create compartment for todo-chatbot resources
oci iam compartment create \
    --name todo-chatbot \
    --description "Todo Chatbot application resources" \
    --compartment-id <root-compartment-ocid>
```

## Step 2: Create VCN

Use the VCN Wizard in OCI Console or CLI:

```bash
# Create VCN with public and private subnets
oci network vcn create \
    --compartment-id <compartment-ocid> \
    --display-name todo-chatbot-vcn \
    --cidr-blocks '["10.0.0.0/16"]'
```

## Step 3: Create OKE Cluster

### Using OCI Console (Recommended)

1. Navigate to **Developer Services** > **Kubernetes Clusters (OKE)**
2. Click **Create Cluster**
3. Select **Quick Create**
4. Configure:
   - Name: `todo-chatbot-cluster`
   - Kubernetes Version: Latest stable (1.28+)
   - Visibility: Public endpoint
   - Shape: VM.Standard.A1.Flex
   - Node count: 2
   - OCPUs per node: 2
   - Memory per node: 12 GB

### Using CLI

```bash
# Create cluster
oci ce cluster create \
    --compartment-id <compartment-ocid> \
    --name todo-chatbot-cluster \
    --vcn-id <vcn-ocid> \
    --kubernetes-version v1.28.2

# Create node pool
oci ce node-pool create \
    --compartment-id <compartment-ocid> \
    --cluster-id <cluster-ocid> \
    --name default-pool \
    --node-shape VM.Standard.A1.Flex \
    --node-shape-config '{"ocpus": 2, "memoryInGBs": 12}' \
    --size 2 \
    --subnet-ids '["<private-subnet-ocid>"]'
```

## Step 4: Configure kubectl

```bash
# Generate kubeconfig
oci ce cluster create-kubeconfig \
    --cluster-id <cluster-ocid> \
    --file ~/.kube/config \
    --region <region> \
    --token-version 2.0.0

# Verify connection
kubectl get nodes
```

## Step 5: Install Required Components

### Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml
```

### Cert-Manager (for TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Dapr

```bash
dapr init -k --wait
```

## Step 6: Create Storage Class

```yaml
# oci-bv-storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: oci-bv
provisioner: blockvolume.csi.oraclecloud.com
parameters:
  csi.storage.k8s.io/fstype: ext4
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
```

```bash
kubectl apply -f oci-bv-storageclass.yaml
```

## Resource Allocation

### Recommended Distribution (Always Free Tier)

| Component | OCPUs | Memory |
|-----------|-------|--------|
| Kubernetes system | 0.5 | 2 GB |
| chat-api (x2) | 1.0 | 2 GB |
| notification | 0.25 | 512 MB |
| recurring-task | 0.25 | 512 MB |
| audit | 0.25 | 512 MB |
| PostgreSQL | 0.5 | 2 GB |
| Redis | 0.25 | 512 MB |
| Kafka (single) | 0.5 | 2 GB |
| **Total** | **3.5** | **10 GB** |

This leaves headroom for Dapr sidecars and system overhead.

## Monitoring Setup

```bash
# Install Prometheus stack (minimal config for free tier)
helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace \
    --set prometheus.prometheusSpec.resources.requests.memory=512Mi \
    --set prometheus.prometheusSpec.retention=3d \
    --set grafana.resources.requests.memory=256Mi
```

## Cost Optimization Tips

1. Use single Kafka broker for non-production
2. Disable audit service if not required
3. Use Autonomous Database instead of in-cluster PostgreSQL
4. Scale down replicas during off-hours

## Next Steps

1. Configure DNS for your domain
2. Set up TLS certificates with Let's Encrypt
3. Configure monitoring and alerting
4. Set up backup procedures
