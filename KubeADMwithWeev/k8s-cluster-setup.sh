#!/bin/bash
set -e

echo "===== Kubernetes Cluster Setup Started ====="

########################################
# Disable Swap
########################################
echo "[Step 1] Disabling swap..."
swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab

########################################
# Load Kernel Modules
########################################
echo "[Step 2] Loading kernel modules..."
cat <<EOF > /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

########################################
# Sysctl Configuration
########################################
echo "[Step 3] Configuring sysctl..."
cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables=1
net.bridge.bridge-nf-call-ip6tables=1
net.ipv4.ip_forward=1
EOF

sysctl --system

########################################
# Install containerd
########################################
echo "[Step 4] Installing containerd..."
apt update
apt install -y containerd

mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml

sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

systemctl restart containerd
systemctl enable containerd

########################################
# Install Kubernetes packages
########################################
echo "[Step 5] Installing Kubernetes components..."
apt install -y apt-transport-https ca-certificates curl gpg

mkdir -p /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.34/deb/Release.key \
| gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
https://pkgs.k8s.io/core:/stable:/v1.34/deb/ /" \
> /etc/apt/sources.list.d/kubernetes.list

apt update
apt install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

########################################
# Configure crictl
########################################
echo "[Step 6] Configuring crictl..."
cat <<EOF > /etc/crictl.yaml
runtime-endpoint: unix:///run/containerd/containerd.sock
image-endpoint: unix:///run/containerd/containerd.sock
timeout: 10
debug: false
EOF

echo "===== Setup Completed Successfully ====="