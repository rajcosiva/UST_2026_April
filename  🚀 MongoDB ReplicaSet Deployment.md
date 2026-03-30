# 🚀 MongoDB ReplicaSet Deployment using Helm (Kubernetes)

This guide helps you deploy a **MongoDB ReplicaSet (3-node cluster)** on Kubernetes using Helm with **automatic node joining**, along with **manual recovery steps** if issues occur.

---

## 📌 Prerequisites

* Kubernetes cluster (kubeadm / EKS / AKS / GKE)
* kubectl installed and configured
* Helm installed

---

# 🧱 Step 1: Verify Kubernetes Cluster

```bash
kubectl get nodes
```

---

# 🧱 Step 2: Install Storage (Mandatory)

```bash
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
```

### Set as default storage class

```bash
kubectl patch storageclass local-path \
-p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Verify

```bash
kubectl get storageclass
```

Expected:

```
local-path (default)
```

---

# 📦 Step 3: Install Helm

```bash
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

---

# 📦 Step 4: Add Bitnami Helm Repo

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

---

# 📁 Step 5: Create Namespace

```bash
kubectl create namespace project
```

---

# 🧾 Step 6: Create values.yaml

```bash
nano values.yaml
```

Paste:

```yaml
architecture: replicaset

replicaCount: 3

arbiter:
  enabled: false

auth:
  enabled: true
  rootPassword: RootPass@123

persistence:
  enabled: true
  storageClass: local-path

podManagementPolicy: OrderedReady
```

---

# 🚀 Step 7: Install MongoDB

```bash
helm install my-mongodb bitnami/mongodb \
-n project \
-f values.yaml
```

---

# ⏳ Step 8: Monitor Pods

```bash
kubectl get pods -n project -w
```

Wait until:

```
my-mongodb-0   1/1 Running
my-mongodb-1   1/1 Running
my-mongodb-2   1/1 Running
```

---

# 🔍 Step 9: Verify Replica Set

```bash
kubectl exec -it my-mongodb-0 -n project -- \
mongosh -u root -p RootPass@123 --authenticationDatabase admin
```

Inside Mongo shell:

```javascript
rs.status()
```

---

## ✅ Expected Output

```
PRIMARY    → my-mongodb-0
SECONDARY  → my-mongodb-1
SECONDARY  → my-mongodb-2
```

---

# 🎉 Final Result

* MongoDB ReplicaSet deployed successfully
* Automatic node joining working
* No manual intervention required

---

# ⚠️ Common Mistakes

* Skipping storage installation
* Using long Helm `--set` commands
* Using arbiter in beginner setup
* Not waiting for pods

---

# 🛠️ Troubleshooting (Manual Fix)

If replica set is not formed properly:

---

## 🔍 Check Pod Status

```bash
kubectl get pods -n project
```

---

## 🔍 Connect to Primary

```bash
kubectl exec -it my-mongodb-0 -n project -- \
mongosh -u root -p RootPass@123 --authenticationDatabase admin
```

---

## 🔍 Check Replica Status

```javascript
rs.status()
```

---

## 🔧 Add Secondary Manually

```javascript
rs.add("my-mongodb-1.my-mongodb-headless.project.svc.cluster.local:27017")
```

---

## 🔧 Add Third Node (if needed)

```javascript
rs.add("my-mongodb-2.my-mongodb-headless.project.svc.cluster.local:27017")
```

---

## 🔄 If Using Arbiter (Optional)

```javascript
rs.addArb("my-mongodb-arbiter-0.my-mongodb-arbiter-headless.project.svc.cluster.local:27017")
```

---
updated
## ⚠️ If `rs.add()` Fails

### Remove Arbiter First

```javascript
rs.remove("my-mongodb-arbiter-0.my-mongodb-arbiter-headless.project.svc.cluster.local:27017")
```

### Add Secondary

```javascript
rs.add("my-mongodb-1.my-mongodb-headless.project.svc.cluster.local:27017")
```

### Add Arbiter Back

```javascript
rs.addArb("my-mongodb-arbiter-0.my-mongodb-arbiter-headless.project.svc.cluster.local:27017")
```

---

## 🔥 Reset Secondary (Last Option)

```bash
kubectl delete pod my-mongodb-1 -n project
kubectl delete pvc datadir-my-mongodb-1 -n project
```

---

# 🧠 Root Cause

* ReplicaSet initialized before all nodes were ready
* Timing issue in distributed systems
* Common in kubeadm/local setups

---

# 💡 Best Practices

* Use 3-node replica set (no arbiter)
* Use `OrderedReady`
* Always wait for pods

---

# 👨‍🏫 Trainer Tip

> “Distributed systems need time — always wait for all pods before verifying.”

---
