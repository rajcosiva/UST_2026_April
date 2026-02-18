# Linux Commands Reference Guide

A structured reference guide for essential Linux commands covering:

- Basic Navigation
- File & Directory Management
- File Viewing
- Search & Text Processing
- Permissions & User Management
- Process Management
- System Monitoring
- Networking
- Service Management

---

# Table of Contents

1. Basic Navigation Commands  
2. File & Directory Management  
3. File Viewing Commands  
4. Search Commands  
5. Text Processing Commands  
6. Permissions & Ownership  
7. User Management  
8. Process Management  
9. System Monitoring  
10. Networking Commands  
11. Service Management  

---

# 1. Basic Navigation Commands

| Command  | Description | Example | Use Case |
|----------|------------|----------|----------|
| pwd      | Show current directory | `pwd` | Identify current location |
| ls       | List files and directories | `ls -ltr` | View files |
| cd       | Change directory | `cd /var/log` | Navigate directories |
| clear    | Clear terminal screen | `clear` | Clean terminal |
| whoami   | Display current user | `whoami` | Verify login user |
| history  | Show command history | `history` | Review past commands |

---

# 2. File & Directory Management

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| touch    | Create empty file | `touch file.txt` | Create new file |
| mkdir    | Create directory | `mkdir project` | Create folder |
| rmdir    | Remove empty directory | `rmdir olddir` | Delete empty folder |
| cp       | Copy file or directory | `cp file1 file2` | Backup file |
| mv       | Move or rename file | `mv file1 /tmp` | Rename or relocate |
| rm       | Remove file | `rm file.txt` | Delete file |
| stat     | Show file metadata | `stat file.txt` | Inspect file details |

---

# 3. File Viewing Commands

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| cat      | Display entire file | `cat file.txt` | View small file |
| more     | View file page by page | `more file.txt` | Read large file |
| less     | Advanced file viewer | `less file.txt` | Scroll & search |
| head     | Show first lines | `head -5 file.txt` | Check header |
| tail     | Show last lines | `tail -10 file.txt` | View recent logs |
| tail -f  | Monitor file live | `tail -f app.log` | Real-time log tracking |

---

# 4. Search Commands

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| grep     | Search text in file | `grep "error" app.log` | Find errors |
| find     | Search files | `find / -name test.txt` | Locate file |
| locate   | Fast file search | `locate httpd.conf` | Quick search |
| which    | Show command path | `which python` | Find executable path |

---

# 5. Text Processing Commands

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| awk      | Process text columns | `awk '{print $1}' file.txt` | Extract data |
| sed      | Stream editor | `sed 's/old/new/g' file.txt` | Replace text |
| cut      | Extract fields | `cut -d":" -f1 /etc/passwd` | Get usernames |
| sort     | Sort lines | `sort file.txt` | Organize data |
| uniq     | Remove duplicates | `uniq file.txt` | Filter repeats |
| wc       | Count lines/words | `wc -l file.txt` | Count entries |
| tr       | Translate characters | `tr a-z A-Z` | Convert case |

---

# 6. Permissions & Ownership

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| chmod    | Change permissions | `chmod 755 file.sh` | Make executable |
| chown    | Change owner | `chown user file.txt` | Fix ownership |
| chgrp    | Change group | `chgrp dev file.txt` | Update group |
| umask    | Default permission mask | `umask` | Check default permissions |

---

# 7. User Management

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| useradd  | Create new user | `useradd rajco` | Add user |
| passwd   | Set user password | `passwd rajco` | Assign password |
| usermod  | Modify user | `usermod -aG sudo rajco` | Add to group |
| userdel  | Delete user | `userdel rajco` | Remove user |
| su       | Switch user | `su - root` | Change identity |
| sudo     | Run command as root | `sudo yum install nginx` | Admin tasks |

---

# 8. Process Management

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| ps       | Show running processes | `ps -ef` | List processes |
| top      | Real-time monitoring | `top` | Monitor CPU/memory |
| kill     | Terminate process | `kill -9 1234` | Stop application |
| pkill    | Kill by name | `pkill java` | Stop Java service |
| nice     | Set process priority | `nice -n 10 script.sh` | Lower priority |
| renice   | Change priority | `renice -n 5 -p 1234` | Adjust running process |

---

# 9. System Monitoring

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| df       | Disk usage | `df -h` | Check disk space |
| du       | Directory size | `du -sh *` | Find large folders |
| free     | Memory usage | `free -g` | Check RAM |
| uptime   | Load average | `uptime` | Check system load |
| nproc    | CPU core count | `nproc` | Capacity planning |
| lscpu    | CPU information | `lscpu` | Hardware details |
| vmstat   | System performance | `vmstat 2` | Monitor performance |

---

# 10. Networking Commands

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| ip a     | Show IP address | `ip a` | Check network |
| ping     | Test connectivity | `ping google.com` | Network test |
| ss       | Show open ports | `ss -tulnp` | Check listening ports |
| netstat  | Network statistics | `netstat -tulnp` | Port verification |
| curl     | Test HTTP/API | `curl http://site` | API testing |
| scp      | Secure file copy | `scp file user@ip:/tmp` | Transfer file |
| rsync    | Sync files | `rsync -av src/ dest/` | Backup data |

---

# 11. Service Management

| Command | Description | Example | Use Case |
|----------|------------|----------|----------|
| systemctl | Manage services | `systemctl status nginx` | Check service status |
| journalctl | View system logs | `journalctl -xe` | Troubleshoot issues |

---
---

# 12. Advanced Monitoring & Performance (DevOps Level)

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| htop | Advanced interactive process viewer | `htop` | Visual CPU & memory monitoring |
| atop | Advanced system monitoring | `atop` | Historical performance tracking |
| iostat | Disk I/O statistics | `iostat -x 2` | Identify disk bottleneck |
| mpstat | CPU stats per core | `mpstat -P ALL 2` | Detect CPU imbalance |
| sar | Historical performance data | `sar -u 1 5` | Performance investigation |
| dstat | Combined resource stats | `dstat` | Real-time resource overview |
| free -m | Memory in MB | `free -m` | Debug memory usage |
| df -i | Inode usage | `df -i` | Troubleshoot inode exhaustion |

---

# 13. Advanced Disk & Storage Management

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| lsblk | List block devices | `lsblk` | Check attached volumes |
| blkid | Display UUIDs | `blkid` | Identify disk |
| mount | Mount filesystem | `mount /dev/sdb1 /mnt` | Attach storage |
| umount | Unmount filesystem | `umount /mnt` | Detach storage |
| fdisk | Partition disk | `fdisk /dev/sdb` | Create partition |
| mkfs | Format filesystem | `mkfs.ext4 /dev/sdb1` | Prepare new disk |
| fsck | Check filesystem | `fsck /dev/sdb1` | Repair filesystem |
| swapon | Enable swap | `swapon -a` | Increase memory |
| swapoff | Disable swap | `swapoff -a` | Troubleshooting memory |

---

# 14. Advanced Networking & Troubleshooting

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| tcpdump | Capture packets | `tcpdump -i eth0` | Network debugging |
| traceroute | Trace network path | `traceroute google.com` | Routing issues |
| mtr | Network diagnostic tool | `mtr google.com` | Latency analysis |
| nc | Netcat utility | `nc -zv localhost 8080` | Port connectivity test |
| telnet | Manual port test | `telnet localhost 8080` | Service validation |
| host | DNS lookup | `host google.com` | DNS debugging |
| dig | Detailed DNS lookup | `dig google.com` | DNS resolution issue |

---

# 15. Log Analysis & Debugging

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| journalctl -u service | View service logs | `journalctl -u nginx` | Debug service failure |
| journalctl -xe | Detailed errors | `journalctl -xe` | Investigate crash |
| lsof | List open files | `lsof -i :8080` | Identify port usage |
| strace | Trace system calls | `strace -p 1234` | Debug hanging process |
| grep -r | Recursive search | `grep -r error /var/log` | Root cause analysis |

### Example Log Pipelines

Find top IP addresses:

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -nr | head
```

Count failed logins:

```bash
grep "Failed password" /var/log/secure | wc -l
```

---

# 16. Cron & Job Scheduling (Automation)

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| crontab -e | Edit cron jobs | `crontab -e` | Schedule automation |
| crontab -l | List cron jobs | `crontab -l` | Verify scheduled jobs |
| crontab -r | Remove cron jobs | `crontab -r` | Cleanup automation |
| at | Schedule one-time job | `at 10:00` | Delayed execution |
| watch | Execute repeatedly | `watch df -h` | Live monitoring |

### Cron Format

```
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of week
│ │ │ └──── Month
│ │ └────── Day of month
│ └──────── Hour
└────────── Minute
```

Example: Daily backup at 2 AM

```bash
0 2 * * * /home/backup.sh
```

---

# 17. Process Control & Background Jobs

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| jobs | List background jobs | `jobs` | Manage scripts |
| bg | Resume in background | `bg %1` | Continue execution |
| fg | Bring to foreground | `fg %1` | Debug interactively |
| nohup | Run after logout | `nohup script.sh &` | Long-running jobs |

---

# 18. Environment & Shell Management

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| export | Set environment variable | `export VAR=value` | Application config |
| env | Show environment variables | `env` | Debug environment |
| source | Reload config | `source ~/.bashrc` | Apply changes |
| set | Show shell variables | `set` | Debug script |

---

# 19. DevOps-Oriented System Information

| Command | Description | Example | DevOps Use Case |
|----------|------------|----------|-----------------|
| uname -a | Kernel information | `uname -a` | Check OS version |
| hostnamectl | Host details | `hostnamectl` | Verify system identity |
| uptime | System uptime | `uptime` | Detect reboot |
| nproc | CPU core count | `nproc` | Size build agents |
| lsblk | Block devices | `lsblk` | Validate cloud volume |
| mount | Mounted filesystems | `mount` | Verify storage mount |

---

# 20. Powerful DevOps Command Pipelines

### Kill process using port 8080

```bash
lsof -t -i:8080 | xargs kill -9
```

### Delete logs older than 7 days

```bash
find /var/log -type f -mtime +7 -delete
```

### Find top CPU consuming processes

```bash
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head
```

### Find largest files in system

```bash
du -ah / | sort -rh | head -20
```

### Check memory usage by process

```bash
ps aux --sort=-%mem | head
```

---

# DevOps Use Cases Covered

- Production troubleshooting
- CI/CD debugging
- Kubernetes node debugging
- Cloud VM monitoring
- Log analysis
- Performance tuning
- Automation scripting
- Incident response

---

# Contribution

Feel free to contribute by adding:

- Advanced Linux commands
- Real-world troubleshooting scenarios
- Automation examples
- DevOps use cases

---

# License

This project is open-source and free to use for educational purposes.
