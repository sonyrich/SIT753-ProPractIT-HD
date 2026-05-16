# TaskManager REST API

![Node.js](https://img.shields.io/badge/Node.js-24.x-green)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Jenkins](https://img.shields.io/badge/CI%2FCD-Jenkins-red)
![SonarCloud](https://img.shields.io/badge/Code%20Quality-SonarCloud-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A production-grade RESTful Task Manager API built with **Node.js** and **Express**.
Designed for the **SIT223/SIT753 7.3HD DevOps Pipeline** assignment — all 7 pipeline stages implemented targeting **Top HD (96–100%)**.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 24 + Express |
| Testing | Jest (unit + integration) |
| Code Quality | SonarCloud |
| Security | npm audit + overrides |
| Containerisation | Docker + Docker Compose |
| CI/CD | Jenkins |
| Monitoring | Prometheus + Grafana |

---

## Pipeline Architecture

Checkout → Build → Test → Code Quality → Security → Deploy (Staging) → Release (Production) → Monitoring

| # | Stage | Tool | Description |
|---|---|---|---|
| 1 | Build | Docker, npm | Builds Node.js app + tags Docker image with build version |
| 2 | Test | Jest | Runs unit + integration tests with coverage report |
| 3 | Code Quality | SonarCloud | Static analysis with exclusions and LCOV coverage |
| 4 | Security | npm audit | Scans dependencies, documents and mitigates CVEs |
| 5 | Deploy | Docker Compose | Deploys to staging (port 3001) with health check |
| 6 | Release | Git tag + Docker Compose | Tags release on GitHub, deploys to production (port 3000) |
| 7 | Monitoring | Prometheus + Grafana | Live metrics, readiness probe, incident simulation |

---

## Jenkins Setup

### Step 1: Run Jenkins Container

```bash
docker run -d \
  --name jenkins \
  --network jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### Step 2: Install All Dependencies Inside Jenkins (Docker, Node.js, SonarScanner)

```bash
docker exec -u root jenkins bash -c "
  apt-get update && \
  apt-get install -y ca-certificates curl gnupg lsb-release wget unzip && \

  install -m 0755 -d /etc/apt/keyrings && \
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
  chmod a+r /etc/apt/keyrings/docker.gpg && \
  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \$(lsb_release -cs) stable\" > /etc/apt/sources.list.d/docker.list && \
  apt-get update && \
  apt-get install -y docker-ce-cli docker-compose-plugin && \

  chmod 666 /var/run/docker.sock && \

  curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
  apt-get install -y nodejs && \

  wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-8.0.1.6346-linux-aarch64.zip -O /tmp/sonar.zip && \
  unzip -q /tmp/sonar.zip -d /opt/ && \
  ln -sf /opt/sonar-scanner-8.0.1.6346-linux-aarch64/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
  rm /tmp/sonar.zip
"
```

> **Note:** If running on Intel/AMD, replace `aarch64` with `x64` in the SonarScanner URL and symlink path.

### Step 3: Verify Installation

```bash
docker exec jenkins docker version
docker exec jenkins docker compose version
docker exec jenkins node --version
docker exec jenkins npm --version
docker exec jenkins sonar-scanner --version
```

### Step 4: Configure Pipeline in Jenkins

| Setting | Value |
|---|---|
| Repository URL | `https://github.com/sonyrich/SIT753-ProPractIT-HD.git` |
| Branch Specifier | `*/main` |
| Script Path | `jenkinsfile` |

### Step 5: Required Jenkins Credentials

| Credential ID | Type | Description |
|---|---|---|
| `GITHUB_CREDENTIALS` | Username + Password (PAT) | GitHub access for checkout and tag push |
| `SONARTOKEN` | Secret text | SonarCloud token |

---

## Quick Start (Local)

```bash
git clone https://github.com/sonyrich/SIT753-ProPractIT-HD.git
cd SIT753-ProPractIT-HD
npm install
cp .env.example .env
npm start
```

## Run Tests

```bash
npm test
```

---

## Docker

```bash
# Staging environment (port 3001)
docker compose -f docker-compose.staging.yml up -d

# Production environment with Prometheus + Grafana (port 3000)
docker compose -f docker-compose.production.yml up -d
```

---

## Service URLs

| Service | URL | Credentials |
|---|---|---|
| App — Production | http://localhost:3000 | — |
| App — Staging | http://localhost:3001 | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3002 | admin / admin123 |
| SonarCloud | https://sonarcloud.io/project/overview?id=sonyrich_HD | — |

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /health | No | Live metrics (uptime, memory, status) |
| GET | /health/ready | No | Readiness probe |
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login — returns JWT |
| GET | /api/tasks | JWT | List all tasks |
| POST | /api/tasks | JWT | Create task |
| GET | /api/tasks/stats | JWT | Task statistics |
| GET | /api/tasks/:id | JWT | Get task by ID |
| PUT | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task |

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Application port | `3000` |
| `JWT_SECRET` | Secret for signing JWTs — inject at runtime, never commit | *(runtime only)* |
| `LOG_LEVEL` | Logging verbosity | `warn` |

Copy `.env.example` to `.env` and fill in `JWT_SECRET` before running locally.

---

## Assignment Context

- **Unit:** SIT223/SIT753 Professional Practice in IT
- **Task:** 7.3HD — DevOps Pipeline with Jenkins
- **Stages implemented:** 7 of 7 (Build, Test, Code Quality, Security, Deploy, Release, Monitoring)
- **Grade target:** Top HD (96–100%)
