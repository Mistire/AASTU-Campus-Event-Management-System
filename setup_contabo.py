#!/usr/bin/env python3
"""
CEMS Contabo VPS Setup Script
Connects via SSH and prepares the server for production deployment.
"""

import paramiko
import time
import sys

HOST = "178.238.228.167"
USERNAME = "root"
PASSWORD = "388Wm4YJbnZ2RP7r"
APP_DIR = "/opt/data-pipeline"   # Disguised folder name — looks like a scraper/data pipeline

def run(client, cmd, timeout=120, ignore_errors=False):
    """Run a command and print live output."""
    print(f"\n\033[94m$ {cmd}\033[0m")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        print(out)
    if err and not ignore_errors:
        print(f"\033[93m[stderr] {err}\033[0m")
    return out, err

def main():
    print("==> Connecting to Contabo VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USERNAME, password=PASSWORD, timeout=30)
    print(f"\033[92m✓ Connected to {HOST}\033[0m")

    # ── Phase 1: System Update & Docker Installation ─────────────────────────
    print("\n\033[1m==> Phase 1: System setup & Docker\033[0m")
    run(client, "apt-get update -q", timeout=120)
    run(client, "apt-get install -y docker.io docker-compose git curl apache2-utils certbot", timeout=180)
    run(client, "systemctl enable docker && systemctl start docker")
    run(client, "usermod -aG docker root", ignore_errors=True)

    # ── Phase 2: Create disguised app folder ────────────────────────────────
    print("\n\033[1m==> Phase 2: Creating disguised app directory\033[0m")
    # The folder is named to look like a data-pipeline/scraper project
    run(client, f"mkdir -p {APP_DIR}")
    # Add a fake README so if anyone navigates there it looks legit
    run(client, f"""cat > {APP_DIR}/README.md << 'EOF'
# Data Pipeline Service
Internal data aggregation and processing pipeline.
Managed by the infrastructure team.
Do not modify without approval.
EOF""")

    # ── Phase 3: Clone the repository ────────────────────────────────────────
    print("\n\033[1m==> Phase 3: Clone repository\033[0m")
    out, _ = run(client, f"ls {APP_DIR}/.git 2>/dev/null && echo EXISTS || echo MISSING")
    if "MISSING" in out:
        run(client, f"git clone https://github.com/Mistire/AASTU-Campus-Event-Management-System.git {APP_DIR}", timeout=120)
    else:
        print("  Repo already cloned, pulling latest...")
        run(client, f"cd {APP_DIR} && git fetch origin && git reset --hard origin/dev", timeout=60)

    # ── Phase 4: Configure swap space for persistence ────────────────────────
    print("\n\033[1m==> Phase 4: Setting up 2GB swap (prevents OOM crashes)\033[0m")
    out, _ = run(client, "swapon --show")
    if "/swapfile" not in out:
        run(client, "fallocate -l 2G /swapfile")
        run(client, "chmod 600 /swapfile")
        run(client, "mkswap /swapfile")
        run(client, "swapon /swapfile")
        run(client, "echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab")
        print("  ✓ 2GB swap created and made persistent across reboots")
    else:
        print("  ✓ Swap already exists")

    # ── Phase 5: Setup htpasswd for ghosting ─────────────────────────────────
    print("\n\033[1m==> Phase 5: Creating Basic Auth credentials for ghosting\033[0m")
    run(client, "mkdir -p /etc/nginx-auth")
    # Username: cems  | Password: defense2026!
    run(client, "htpasswd -cb /etc/nginx-auth/.htpasswd cems defense2026!")
    print("  ✓ Ghost credentials created: username=cems  password=defense2026!")

    # ── Phase 6: Make swap & Docker restart persistent ────────────────────────
    print("\n\033[1m==> Phase 6: Ensure Docker auto-restarts on server reboot\033[0m")
    run(client, "systemctl enable docker")

    # ── Phase 7: Final disk check ────────────────────────────────────────────
    print("\n\033[1m==> Phase 7: Server resource check\033[0m")
    run(client, "free -h")
    run(client, "df -h /")

    print(f"""
\033[92m╔════════════════════════════════════════════════════╗
║          ✓ Contabo VPS Setup Complete!             ║
╠════════════════════════════════════════════════════╣
║  App directory : {APP_DIR}                  ║
║  Ghost login   : cems / defense2026!              ║
║  Next step     : Set up DuckDNS then push to dev  ║
╚════════════════════════════════════════════════════╝\033[0m
""")

    client.close()

if __name__ == "__main__":
    main()
