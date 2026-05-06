# TaskManager REST API

A production-grade RESTful Task Manager API built with **Node.js** and **Express**.
Designed for the SIT223/SIT753 DevOps Pipeline Jenkins assignment.

## Quick Start
```bash
git clone <your-repo-url>
cd nodejs-taskmanager-api
npm install
cp .env.example .env
npm start
```

## Run Tests
```bash
npm test
```

## Docker
```bash
docker build -t taskmanager-api:1.0.0 .
docker-compose -f docker-compose.staging.yml up -d
```

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | /health | Health + metrics |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login (returns JWT) |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create task |
| GET | /api/tasks/stats | Statistics |
| GET | /api/tasks/:id | Get task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |