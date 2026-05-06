const request = require('supertest');
const app = require('../../src/app');
const TaskModel = require('../../src/models/taskModel');
const UserModel = require('../../src/models/userModel');

describe('TaskManager API Integration Tests', () => {

  beforeAll(async () => {
    TaskModel._reset();
    UserModel._reset();
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  });

  afterEach(() => { TaskModel._reset(); });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ name: 'Dup', email: 'test@example.com', password: 'pw1234' });
      expect(res.status).toBe(409);
    });
    it('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register')
        .send({ name: 'New', email: 'new@example.com', password: '123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app).post('/api/tasks')
        .send({ title: 'My First Task', priority: 'high' });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('My First Task');
      expect(res.body.data).toHaveProperty('id');
    });
    it('should reject task with no title', async () => {
      const res = await request(app).post('/api/tasks').send({ description: 'No title' });
      expect(res.status).toBe(400);
    });
    it('should reject invalid status', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Bad', status: 'flying' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      TaskModel.create({ title: 'T1', userId: 'u1' });
      TaskModel.create({ title: 'T2', userId: 'u2' });
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });
    it('should filter tasks by status', async () => {
      TaskModel.create({ title: 'P1', status: 'pending', userId: 'u1' });
      TaskModel.create({ title: 'D1', status: 'completed', userId: 'u1' });
      const res = await request(app).get('/api/tasks?status=completed');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      const task = TaskModel.create({ title: 'Find Me', userId: 'u1' });
      const res = await request(app).get(`/api/tasks/${task.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(task.id);
    });
    it('should return 404 for unknown task', async () => {
      const res = await request(app).get('/api/tasks/unknown-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const task = TaskModel.create({ title: 'Before', userId: 'u1' });
      const res = await request(app).put(`/api/tasks/${task.id}`)
        .send({ title: 'After', status: 'completed' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('After');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = TaskModel.create({ title: 'Bye', userId: 'u1' });
      const res = await request(app).delete(`/api/tasks/${task.id}`);
      expect(res.status).toBe(200);
    });
    it('should return 404 for unknown task', async () => {
      const res = await request(app).delete('/api/tasks/unknown-id');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return task statistics', async () => {
      TaskModel.create({ title: 'T1', status: 'pending', priority: 'high', userId: 'u1' });
      TaskModel.create({ title: 'T2', status: 'completed', priority: 'low', userId: 'u1' });
      const res = await request(app).get('/api/tasks/stats');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byStatus');
    });
  });
});