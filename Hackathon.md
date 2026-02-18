# 🚀 DevOps Hackathon Scenarios

This repository contains real-world DevOps engineering challenges categorized into:

- 🐍 Python-Oriented Scenarios
- 🐚 Shell Script-Oriented Scenarios
- 🔄 Hybrid (Python + Shell) Scenarios

Each scenario is designed to evaluate practical DevOps problem-solving skills.

---

# 🐍 PYTHON-ORIENTED SCENARIOS
> Logic-heavy, structured data handling, concurrency, security, APIs

---

## 1️⃣ Ghost File Recovery Monitor

**Skill Focus:** File monitoring, logging, recovery automation  

### Problem Statement
Accidental deletion of critical files in a shared production directory causes downtime.

### Objective
Build a monitoring system that:

- Detects file deletions in real time  
- Restores deleted files from a secure shadow location  
- Logs metadata (file name, timestamp, user)  
- Maintains an audit trail  

---

## 2️⃣ Local Port & Process “Traffic Cop”

**Skill Focus:** System inspection, security validation  

### Problem Statement
Security suspects unauthorized services running on the server.

### Objective
Build a tool that:

- Maps open ports to PIDs and users  
- Compares results with an approved whitelist  
- Flags suspicious ports  
- Generates a structured security report  

---

## 3️⃣ Intelligent Log “Anomalizer”

**Skill Focus:** Log analysis, data processing  

### Problem Statement
Production logs do not always contain explicit “ERROR” keywords.

### Objective
Build a tool that:

- Analyzes word frequency in logs  
- Identifies rare or unusual patterns  
- Flags potential anomalies  
- Produces anomaly insights summary  

---

## 4️⃣ Multi-Threaded File Searcher

**Skill Focus:** Concurrency, performance optimization  

### Problem Statement
Security audit requires scanning thousands of files for sensitive strings.

### Objective
Build a high-performance parallel search tool that:

- Searches across directories  
- Returns file name, line number, and snippet  
- Uses multi-threading or multiprocessing  
- Optimizes search time  

---

## 5️⃣ Secure File Vault with Audit Logs

**Skill Focus:** Encryption, authentication, logging  

### Problem Statement
Sensitive files require encryption on developer machines.

### Objective
Build a vault tool that:

- Encrypts and decrypts files using a master password  
- Logs all access attempts  
- Prevents unauthorized access  
- Maintains an audit log  

---

## 6️⃣ Automated Config Validator

**Skill Focus:** Structured validation, schema enforcement  

### Problem Statement
Incorrect configuration files caused deployment failures.

### Objective
Build a tool that:

- Validates YAML / JSON / INI files  
- Enforces schema rules  
- Fails validation when incorrect  
- Generates readable validation output  

---

## 7️⃣ System Snapshot & Drift Detection Tool

**Skill Focus:** System state comparison  

### Problem Statement
Post-maintenance system behavior changed unexpectedly.

### Objective
Build a snapshot tool that captures:

- Installed packages  
- Environment variables  
- Active users  
- Running services  

Then compare snapshots to detect configuration drift.

---

## 8️⃣ Local Webhook Trigger Service

**Skill Focus:** HTTP server, automation integration  

### Problem Statement
CI/CD pipeline must remotely trigger maintenance scripts.

### Objective
Build a lightweight HTTP service that:

- Accepts secure webhook requests  
- Executes predefined scripts  
- Logs requests and results  
- Prevents unauthorized execution  

---

# 🐚 SHELL SCRIPT–ORIENTED SCENARIOS
> OS-level automation, monitoring, command orchestration

---

## 9️⃣ Disk Usage Alert Script

**Skill Focus:** Monitoring and alerting  

### Problem Statement
Production systems run out of disk space without warning.

### Objective
Build a shell script that:

- Monitors disk usage  
- Triggers alert when threshold exceeded  
- Logs alert details  
- Can run via cron  

---

## 🔟 Automated Log Rotation Manager

**Skill Focus:** File lifecycle management  

### Problem Statement
Application logs grow indefinitely.

### Objective
Build a shell-based log rotation tool that:

- Compresses old logs  
- Deletes logs older than X days  
- Maintains rotation history  
- Logs all operations  

---

## 1️⃣1️⃣ Server Health Check Script

**Skill Focus:** System diagnostics  

### Problem Statement
Operations team requires quick health summary.

### Objective
Build a script that reports:

- CPU usage  
- Memory usage  
- Disk usage  
- Top processes  
- Active network connections  

Generate a structured summary report.

---

## 1️⃣2️⃣ Automated Backup & Cleanup Script

**Skill Focus:** Backup automation  

### Problem Statement
Application data must be backed up daily.

### Objective
Build a shell script that:

- Creates timestamped backups  
- Compresses them  
- Deletes old backups based on retention policy  
- Logs backup status  

---

## 1️⃣3️⃣ Service Monitoring & Auto-Restart Tool

**Skill Focus:** Reliability engineering  

### Problem Statement
Critical services crash without notification.

### Objective
Build a monitoring script that:

- Checks if service is running  
- Restarts if stopped  
- Logs restart attempts  
- Alerts if restart fails  

---

# 🔄 HYBRID (PYTHON + SHELL) SCENARIOS

---

## 1️⃣4️⃣ Disk Space “Emergency Brake”

**Skill Focus:** Monitoring + automation recovery  

### Problem Statement
Disk exhaustion caused application outage.

### Objective
Build an automated recovery system that:

- Continuously monitors disk usage  
- Identifies top 5 largest files when threshold crossed  
- Compresses and moves files safely  
- Logs all actions  

### Implementation Suggestion
- Shell → Gather system metrics  
- Python → Sorting logic, compression handling, reporting  

---

## 1️⃣5️⃣ DevOps CI/CD Pre-Deployment Validator

**Skill Focus:** Environment validation + reporting  

### Problem Statement
Before deploying to production, environment must be validated.

### Objective
Build a tool that:

- Checks disk space  
- Validates required ports availability  
- Verifies required services are running  
- Validates configuration files  
- Generates structured readiness report  

### Implementation Suggestion
- Shell → Perform system checks  
- Python → Validation logic + structured report (JSON / HTML)  

---

# 📊 Evaluation Criteria

Participants will be evaluated on:

- Code quality and readability  
- Error handling and edge cases  
- Logging and observability  
- Security considerations  
- Performance optimization  
- Real-world practicality  
- Documentation clarity  

---

# 🏁 Submission Expectations

Each submission must include:

- Clear README documentation  
- Execution instructions  
- Sample input/output  
- Logging output examples  
- Improvement suggestions  

---

**  
Build reliable. Build secure. Build scalable. 🚀**
