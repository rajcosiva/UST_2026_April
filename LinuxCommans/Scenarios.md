# Linux Production Troubleshooting Scenarios (DevOps Edition)

This document contains real-world Linux troubleshooting scenarios designed for:

- DevOps Engineers
- Site Reliability Engineers (SRE)
- Production Support Engineers
- Cloud Engineers
- CI/CD Engineers

Each scenario includes:
- Problem Statement
- Investigation Steps
- Root Cause Possibilities
- Resolution Approach
- Learning Outcome

---

# Table of Contents

1. Disk Full – Application Crash  
2. High CPU Usage  
3. Memory Leak  
4. Port Already in Use  
5. Service Failing  
6. Load Average Too High  
7. Inode Exhaustion  
8. CI/CD Agent Failure  
9. Network Not Reachable  
10. DNS Resolution Failure  
11. Too Many Open Files  
12. Zombie Processes  
13. High Swap Usage  
14. Disk Not Mounted After Reboot  
15. Suspicious Login Activity  
16. Application Not Listening on Port  
17. Log File Growing Too Fast  
18. Cron Job Not Executing  
19. Kubernetes Node Resource Exhaustion  
20. Slow Disk I/O  
21. Container Not Starting  
22. Unexpected Server Restart  
23. High Network Traffic Spike  
24. Permission Denied Error  
25. Log Analysis Challenge  

---

# 1. Disk Full – Application Crash

## Problem
Application fails with:
```
No space left on device
```

## Investigation

```bash
df -h
df -i
du -sh /* | sort -rh | head
du -ah / | sort -rh | head -20
```

## Possible Causes
- Logs not rotated
- Backup accumulation
- Temporary files
- Docker image buildup

## Resolution

```bash
find /var/log -type f -mtime +7 -delete
```

## Learning Outcome
Understanding disk space vs inode troubleshooting.

---

# 2. High CPU Usage

## Problem
Server becomes slow.

## Investigation

```bash
top
ps -eo pid,cmd,%cpu --sort=-%cpu | head
```

## Possible Causes
- Infinite loops
- Heavy jobs
- Traffic spike

## Resolution

```bash
renice -n 10 -p PID
kill -9 PID
```

## Learning Outcome
CPU bottleneck identification and control.

---

# 3. Memory Leak

## Investigation

```bash
free -m
ps aux --sort=-%mem | head
vmstat 2
```

## Possible Causes
- Application memory leak
- Excess containers
- Improper GC tuning

## Learning Outcome
Memory pressure debugging.

---

# 4. Port Already in Use

## Investigation

```bash
ss -tulnp | grep 8080
lsof -i :8080
```

## Resolution

```bash
kill -9 PID
```

## Learning Outcome
Port conflict resolution.

---

# 5. Service Failing

## Investigation

```bash
systemctl status nginx
journalctl -u nginx
```

## Learning Outcome
Systemd service debugging.

---

# 6. Load Average Too High

## Investigation

```bash
uptime
iostat -x 2
top
```

## Learning Outcome
Understanding CPU vs I/O vs memory bottleneck.

---

# 7. Inode Exhaustion

## Investigation

```bash
df -i
find /tmp | wc -l
```

## Learning Outcome
Inode usage awareness.

---

# 8. CI/CD Agent Failure

## Investigation

```bash
df -h
free -m
journalctl -u jenkins
```

## Learning Outcome
CI/CD troubleshooting skills.

---

# 9. Network Not Reachable

## Investigation

```bash
ping google.com
traceroute google.com
mtr google.com
```

## Learning Outcome
Network routing analysis.

---

# 10. DNS Resolution Failure

## Investigation

```bash
dig google.com
host google.com
```

## Learning Outcome
DNS troubleshooting.

---

# 11. Too Many Open Files

## Investigation

```bash
ulimit -n
lsof | wc -l
```

## Learning Outcome
File descriptor management.

---

# 12. Zombie Processes

## Investigation

```bash
ps aux | grep Z
```

## Learning Outcome
Process lifecycle management.

---

# 13. High Swap Usage

## Investigation

```bash
free -m
swapon -s
```

## Learning Outcome
Swap performance impact.

---

# 14. Disk Not Mounted After Reboot

## Investigation

```bash
lsblk
mount
cat /etc/fstab
```

## Learning Outcome
Persistent mount configuration.

---

# 15. Suspicious Login Activity

## Investigation

```bash
last
who
grep "Failed password" /var/log/secure
```

## Learning Outcome
Basic security incident detection.

---

# 16. Application Not Listening on Port

## Investigation

```bash
ss -tulnp
curl localhost:8080
```

## Learning Outcome
Application port debugging.

---

# 17. Log File Growing Too Fast

## Investigation

```bash
du -sh /var/log/*
```

## Learning Outcome
Log rotation management.

---

# 18. Cron Job Not Executing

## Investigation

```bash
crontab -l
grep CRON /var/log/syslog
```

## Learning Outcome
Automation debugging.

---

# 19. Kubernetes Node Resource Exhaustion

## Investigation

```bash
free -m
df -h
nproc
```

## Learning Outcome
Node-level troubleshooting.

---

# 20. Slow Disk I/O

## Investigation

```bash
iostat -x 2
```

## Learning Outcome
Disk performance analysis.

---

# 21. Container Not Starting

## Investigation

```bash
free -m
df -h
uname -a
```

## Learning Outcome
Container host validation.

---

# 22. Unexpected Server Restart

## Investigation

```bash
last reboot
uptime
```

## Learning Outcome
Reboot root cause analysis.

---

# 23. High Network Traffic Spike

## Investigation

```bash
tcpdump -i eth0
```

## Learning Outcome
Traffic monitoring.

---

# 24. Permission Denied Error

## Investigation

```bash
ls -l file.sh
chmod +x file.sh
```

## Learning Outcome
Linux permission fundamentals.

---

# 25. Log Analysis Challenge

## Tasks

Find top IPs:

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head
```

Count 500 errors:

```bash
grep "500" access.log | wc -l
```

Extract unique URLs:

```bash
awk '{print $7}' access.log | sort | uniq
```

## Learning Outcome
Real-world log analytics skills.

---

# Final Objective

These scenarios simulate real production incidents.

Mastering them prepares you for:

- DevOps Roles
- SRE Roles
- Cloud Engineering
- Production Support
- CI/CD Engineering
- Incident Response

---

# Recommended Practice Strategy

1. Break your own VM intentionally.
2. Simulate failures.
3. Investigate using commands.
4. Document root cause.
5. Practice repeatedly.

---

# License

Free to use for educational and training purposes.
