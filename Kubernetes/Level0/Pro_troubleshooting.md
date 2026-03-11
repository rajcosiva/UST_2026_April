# Kubernetes Pod Troubleshooting Guide

This guide explains common Kubernetes Pod errors with:

* Theory
* Example YAML (Declarative approach)
* Imperative Commands
* Expected Output
* Explanation
* Fix

These scenarios help understand **real-world Kubernetes troubleshooting**.

---

# 1️⃣ ImagePullBackOff

## Theory

`ImagePullBackOff` occurs when Kubernetes cannot pull a container image from the container registry.

When a Pod is created, the **kubelet** on the node attempts to pull the image.

If pulling fails repeatedly:

```
ErrImagePull → ImagePullBackOff
```

The **BackOff** indicates Kubernetes is waiting before retrying again.

---

## Declarative YAML (Causing Error)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: imagepull-error
spec:
  containers:
  - name: nginx
    image: ngnix
```

The image name is incorrect (`ngnix` instead of `nginx`).

---

## Imperative Command (Causing Error)

```bash
kubectl run imagepull-error --image=ngnix
```

---

## Output

```
kubectl get pods

NAME              READY   STATUS             RESTARTS   AGE
imagepull-error   0/1     ImagePullBackOff   0          10s
```

---

## Detailed Explanation

The node tries to pull the image:

```
docker pull ngnix
```

But the registry does not contain that image.

Check events:

```
kubectl describe pod imagepull-error
```

Example:

```
Failed to pull image "ngnix"
Back-off pulling image
```

---

## Fix

Correct the image name:

```yaml
image: nginx
```

Or recreate using:

```bash
kubectl run nginx --image=nginx
```

---

# 2️⃣ CrashLoopBackOff

## Theory

`CrashLoopBackOff` occurs when a container repeatedly starts and crashes.

Restart loop:

```
Start → Crash → Restart → Crash → BackOff
```

---

## Declarative YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: crashloop-pod
spec:
  containers:
  - name: busybox
    image: busybox
    command: ["false"]
```

---

## Imperative Command

```
kubectl run crashloop-pod --image=busybox -- false
```

---

## Output

```
NAME           READY   STATUS             RESTARTS
crashloop-pod  0/1     CrashLoopBackOff   5
```

---

## Explanation

Container executes:

```
false
```

`false` exits with error code `1`.

Kubernetes restarts the container repeatedly.

Check logs:

```
kubectl logs crashloop-pod
```

---

## Fix

Use a long running command:

```yaml
command: ["sleep","3600"]
```

Or:

```
kubectl run busybox --image=busybox -- sleep 3600
```

---

# 3️⃣ Pending Pod

## Theory

A Pod stays in **Pending** when the scheduler cannot assign it to any node.

Possible causes:

* Insufficient CPU
* Insufficient Memory
* Node selector mismatch
* Taints and tolerations
* Volume scheduling issues

---

## Declarative YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pending-pod
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      requests:
        memory: "100Gi"
```

---

## Imperative Command

```
kubectl run pending-pod --image=nginx --requests='memory=100Gi'
```

---

## Output

```
NAME          READY   STATUS    RESTARTS
pending-pod   0/1     Pending   0
```

---

## Explanation

Check scheduling events:

```
kubectl describe pod pending-pod
```

Example:

```
0/2 nodes available: insufficient memory
```

---

## Fix

Reduce resource request:

```yaml
memory: "128Mi"
```

---

# 4️⃣ CreateContainerConfigError

## Theory

This occurs when container configuration references resources that do not exist.

Common causes:

* Missing Secret
* Missing ConfigMap
* Incorrect environment reference
* Volume configuration error

---

## Declarative YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-error
spec:
  containers:
  - name: nginx
    image: nginx
    env:
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

---

## Imperative Example

Create Pod referencing a missing secret:

```
kubectl run config-error --image=nginx
```

(then edit pod spec to reference missing secret)

---

## Output

```
NAME          READY   STATUS                       RESTARTS
config-error  0/1     CreateContainerConfigError   0
```

---

## Explanation

The Pod references:

```
secret: db-secret
```

But the secret does not exist.

Check events:

```
kubectl describe pod config-error
```

Example:

```
Error: secret "db-secret" not found
```

---

## Fix

Create the secret:

```
kubectl create secret generic db-secret --from-literal=password=123
```

---

# 5️⃣ OOMKilled

## Theory

`OOMKilled` means the container exceeded its **memory limit**.

OOM = **Out Of Memory**

When memory exceeds the defined limit:

* Linux kernel kills the container
* Kubernetes restarts the container

---

## Declarative YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: memory-pod
spec:
  containers:
  - name: nginx
    image: nginx
    resources:
      limits:
        memory: "32Mi"
```

---

## Imperative Command

```
kubectl run memory-pod --image=nginx --limits='memory=32Mi'
```

---

## Output

```
NAME         READY   STATUS      RESTARTS
memory-pod   0/1     OOMKilled   3
```

---

## Explanation

Check Pod details:

```
kubectl describe pod memory-pod
```

Example:

```
Last State: Terminated
Reason: OOMKilled
```

---

## Fix

Increase memory limit:

```yaml
memory: "256Mi"
```

---

# 6️⃣ RunContainerError

## Theory

`RunContainerError` happens when the container runtime cannot start the process.

Typical causes:

* Invalid command
* Missing binary
* Permission issues

---

## Declarative YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: command-error
spec:
  containers:
  - name: test
    image: busybox
    command: ["notexist"]
```

---

## Imperative Command

```
kubectl run command-error --image=busybox -- notexist
```

---

## Output

```
NAME           READY   STATUS              RESTARTS
command-error  0/1     RunContainerError   0
```

---

## Explanation

The container tries to run:

```
notexist
```

But that binary does not exist.

Check logs:

```
kubectl logs command-error
```

Example:

```
exec: "notexist": executable file not found
```

---

## Fix

Use valid command:

```yaml
command: ["sleep","3600"]
```

---

# 7️⃣ Service Port Mismatch

## Theory

A Service routes traffic using:

```
port → targetPort
```

If `targetPort` does not match the container port, traffic cannot reach the application.

---

## Pod YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-app
  labels:
    app: web
spec:
  containers:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```

---

## Incorrect Service YAML

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
```

---

## Imperative Command

Create service:

```
kubectl expose pod nginx-app --port=80 --target-port=8080 --name=web-service
```

---

## Explanation

Service forwards traffic to:

```
targetPort: 8080
```

But container listens on:

```
80
```

Traffic fails.

---

## Fix

```
targetPort: 80
```

---

# 8️⃣ ReplicaSet Selector Mismatch

## Theory

ReplicaSet manages Pods using **label selectors**.

If Pod labels do not match the selector, the ReplicaSet cannot manage those Pods.

---

## Incorrect YAML

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: web-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
```

---

## Explanation

ReplicaSet selector:

```
app: web
```

Pod label:

```
app: nginx
```

Selector does not match.

ReplicaSet will fail to manage the Pods.

---

## Fix

```
labels:
  app: web
```

---

# 🔎 Most Important Debugging Commands

These commands are used by Kubernetes engineers for troubleshooting.

## Pod Inspection

```
kubectl get pods
kubectl get pods -o wide
kubectl describe pod <pod-name>
```

---

## Logs

```
kubectl logs <pod-name>
kubectl logs -f <pod-name>
```

---

## Execute Inside Container

```
kubectl exec -it <pod-name> -- sh
kubectl exec -it <pod-name> -- bash
```

---

## Events

```
kubectl get events
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## Resource Usage

```
kubectl top pod
kubectl top node
```

---

# 🚀 Summary

These errors represent the **most common Kubernetes production failures**:

| Error                        | Cause                        |
| ---------------------------- | ---------------------------- |
| ImagePullBackOff             | Image cannot be pulled       |
| CrashLoopBackOff             | Container repeatedly crashes |
| Pending                      | Scheduler cannot place Pod   |
| CreateContainerConfigError   | Missing config/secret        |
| OOMKilled                    | Memory limit exceeded        |
| RunContainerError            | Invalid command              |
| Service Port Mismatch        | Service → Pod port mismatch  |
| ReplicaSet Selector Mismatch | Label mismatch               |

Understanding these scenarios is essential for **real-world Kubernetes troubleshooting and CKA-level operations**.

---
