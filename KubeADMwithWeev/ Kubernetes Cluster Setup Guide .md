# Kubernetes Cluster Setup Guide (kubeadm + containerd + Weave)

## 📌 Prerequisites

* Ubuntu 20.04 / 22.04
* Minimum:

  * Master: 2 CPU / 4GB RAM
  * Worker: 2 CPU / 2GB RAM
* Root access (sudo or `sudo su`)
* Open ports (AWS / firewall):

  * 6443 (API Server)
  * 10250 (kubelet)
  * 30000–32767 (NodePort) 
  * Or All Traffic(just For Practise)

---

## 🚀 Step 1: Run Setup Script (ALL NODES Master and Worker Nodes)

### Copy script:

```
vi k8s-cluster-setup.sh
```

Paste script and run:

```
chmod +x k8s-cluster-setup.sh
./k8s-cluster-setup.sh
```

👉 Run on:

* Master node
* Worker nodes

---

## 🧠 Step 2: Initialize Master Node

```
kubeadm init --apiserver-advertise-address=<MASTER_PRIVATE_IP>
```

Example:

```
kubeadm init --apiserver-advertise-address=172.31.x.x
```

---

## 🔧 Step 3: Configure kubectl (MASTER)

```
mkdir -p /root/.kube
cp /etc/kubernetes/admin.conf /root/.kube/config
```

---

## 🌐 Step 4: Install Network (Weave)

```
kubectl apply -f https://github.com/weaveworks/weave/releases/download/v2.8.1/weave-daemonset-k8s.yaml
```

---

## 👷 Step 5: Join Worker Nodes

Run on worker nodes:

```
kubeadm join <MASTER_IP>:6443 --token <TOKEN> \
--discovery-token-ca-cert-hash sha256:<HASH>
```

If lost:

```
kubeadm token create --print-join-command
```

---

## ✅ Step 6: Verify Cluster

### Check nodes:

```
kubectl get nodes
```

### Check system pods:

```
kubectl get pods -n kube-system
```

---

## 🚀 Step 7: Test Deployment

```
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --type=NodePort --port=80
```

Check:

```
kubectl get svc
```

Access:

```
http://<NODE_IP>:<NODE_PORT>
```

---

## 🔍 Troubleshooting

### Check kubelet logs:

```
journalctl -u kubelet -f
```

### Check containers:

```
crictl ps -a
```

### Restart services:

```
systemctl restart containerd
systemctl restart kubelet
```

---

## 🎯 Final Validation Checklist

✔ Nodes are Ready
✔ All pods are Running
✔ Weave network is Running
✔ DNS working
✔ App accessible via NodePort

---

## 💡 Notes

* Do NOT use `--pod-network-cidr` (Weave doesn’t need it)
* Avoid low-memory instances (t2.micro ❌)
* Use private IP for AWS setup

---

## 🎉 You are Done!

Your Kubernetes cluster is ready for:

* Deployments
* Services
* CI/CD pipelines
* Monitoring setup

---
