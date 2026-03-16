#!/bin/bash

echo "================================="
echo "Installing Metrics Server (Secure TLS)"
echo "================================="

echo "Step 1(On Worker Node): Enable kubelet TLS bootstrap"

sudo sed -i 's/serverTLSBootstrap: false/serverTLSBootstrap: true/g' /var/lib/kubelet/config.yaml

echo "Restarting kubelet..."
sudo systemctl restart kubelet

sleep 10

echo "Step 2 (On Worker Node): Checking Certificate Signing Requests"
kubectl get csr

echo "Approving pending CSRs..."

for csr in $(kubectl get csr | grep Pending | awk '{print $1}')
do
kubectl certificate approve $csr
done

echo "Step 3:(Master Node) Installing Metrics Server"

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

echo "Waiting for Metrics Server to start..."
sleep 30

echo "Step 4:(Master Node) Checking Metrics Server pod"

kubectl get pods -n kube-system | grep metrics

echo "Step 5: Checking Metrics API"

kubectl get apiservice | grep metrics

echo "Step 6: Testing Metrics"

kubectl top nodes

echo "================================="
echo "Metrics Server Installation Done"
echo "================================="
