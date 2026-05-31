# CEMS Monorepo AWS Deployment Guide

This guide walks you through the step-by-step process of deploying your monorepo to AWS EC2. It incorporates the infrastructure settings you shared in your screenshots and explains how to connect them with the existing GitHub Actions workflow (`deploy.yml`).

---

## 1. Launch the EC2 Instance (AWS Console)
Based on your screenshots, you are already on the right track. Complete the "Launch an Instance" process with these settings:

1. **Name**: Give your instance a recognizable name (e.g., `cems-production-server`).
2. **OS Image (AMI)**: Select `Ubuntu 24.04 LTS` (as shown in your screenshot).
3. **Instance Type**: Select `t3.micro` or `t3.medium`. Note that building Next.js and NestJS at the same time is very CPU/RAM intensive. If a `t3.micro` runs out of memory (OOM) during the build, you may need a `t3.medium` or to configure a Swap file (explained below).
4. **Key Pair (Login)**: Create a new key pair (e.g., `cems-key`) as an `RSA` or `ED25519` `.pem` file. **Download this file** and keep it safe; you will need it for GitHub Secrets.
5. **Network Settings**: 
   - Check **Allow SSH traffic from Anywhere** (TCP Port 22). 
   - Check **Allow HTTP traffic from the internet** (TCP Port 80).
   - Check **Allow HTTPS traffic from the internet** (TCP Port 443).
   - This ensures your application is reachable from the web.
6. **Configure Storage**: Set it to **16 GiB gp3** minimum (as in your screenshot), though **20 GiB** is recommended because Docker images in a monorepo can consume significant disk space over time.
7. Click **Launch Instance**.

---

## 2. Prepare the EC2 Instance
Once the instance is in the "Running" state, SSH into it from your local terminal:

```bash
# Connect to your server (replace with your EC2 public IP and path to your .pem key file)
ssh -i /path/to/cems-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Run the following commands on the server to install necessary dependencies.

### A. Install Docker and Docker Compose
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl enable --now docker

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Add the 'ubuntu' user to the docker group so you don't need 'sudo' for docker commands
sudo usermod -aG docker ubuntu
```
*(Note: You will need to log out of SSH and log back in for the group change to take effect).*

### B. Add Swap Memory (Crucial for t3.micro)
Because monorepo builds consume high RAM, add a 4GB Swap file to prevent the server from freezing during deployment:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### C. Initialize the Application Directory
Your `deploy.yml` workflow expects the codebase to already exist in `/app/cems`. Let's create it and give ownership to the `ubuntu` user:

```bash
# Create the directory
sudo mkdir -p /app/cems

# Grant ownership to the ubuntu user
sudo chown -R ubuntu:ubuntu /app/cems

# Initialize git and add the origin remote
cd /app/cems
git init
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/AASTU-Campus-Event-Management-System.git
```

---

## 3. Configure GitHub Secrets
Your GitHub Actions CI/CD requires secrets to securely SSH into the server and to inject the `.env` file containing database and SMTP credentials.

On GitHub, go to your repository: **Settings > Secrets and variables > Actions > New repository secret**.

Add the following secrets:

### Server Connection Secrets
- `EC2_HOST`: Your EC2 Instance's **Public IPv4 address**.
- `EC2_USER`: `ubuntu`
- `EC2_SSH_KEY`: The **entire contents** of the `.pem` key file you downloaded during step 1 (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`).

### Application Environment Secrets
*(These populate the `.env` file dynamically during deployment)*
- `DATABASE_URL`: `postgresql://postgres:<PASSWORD>@postgres:5432/cems?schema=public`
- `POSTGRES_PASSWORD`: A secure password for PostgreSQL.
- `JWT_SECRET`: A secure random string for signing JWT tokens.
- `JWT_REFRESH_SECRET`: Another secure random string.
- `JWT_EXPIRATION`: e.g., `15m`
- `JWT_REFRESH_EXPIRATION`: e.g., `7d`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: Your email provider settings.
- `NEXT_PUBLIC_API_URL`: `http://<YOUR_EC2_PUBLIC_IP>:4000/api/v1` (or your domain).
- `BACKEND_URL`: `http://cems-api:4000` (Docker internal networking).
- `FRONTEND_URL`: `http://<YOUR_EC2_PUBLIC_IP>:3000`
- `EMAIL_VERIFICATION_TOKEN_TTL`: `24`
- `RESET_TOKEN_TTL_MINUTES`: `15`
- `SEED_SUPERUSER_EMAIL`, `SEED_SUPERUSER_PASSWORD`, `SEED_SUPERUSER_FULL_NAME`: Credentials for an initial admin account.

---

## 4. Trigger the Deployment
With the EC2 instance prepared and GitHub Secrets configured, you can trigger the deployment.

According to your workflow (`.github/workflows/deploy.yml`), you simply need to push to the `feat/aws-deployment` branch or merge into `dev`.

```bash
# From your local machine
git checkout feat/aws-deployment
git push origin feat/aws-deployment
```

### Monitoring the Deployment
1. Go to the **Actions** tab in your GitHub repository.
2. Click on the running "Deploy to AWS EC2" workflow.
3. You will see it successfully SSH to your server, pull the latest code in `/app/cems`, generate the `.env` file, and run `docker compose build`.

## 5. Summary
Because this is a Monorepo, Docker Compose coordinates everything. If only the frontend changes, Docker's cache skips rebuilding the backend Python or Node layers, vastly accelerating continuous deployments. The configuration above perfectly readies your environment to handle the `deploy.yml` pipeline.
