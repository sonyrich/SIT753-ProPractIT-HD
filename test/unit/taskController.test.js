const TaskModel = require('../../src/models/taskModel');

describe('TaskModel Unit Tests', () => {
  beforeEach(() => { TaskModel._reset(); });

  describe('create()', () => {
    it('should create a task with required fields', () => {
      const task = TaskModel.create({ title: 'Test Task', userId: 'user1' });
      expect(task).toHaveProperty('id');
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
    });
    it('should create a task with custom status and priority', () => {
      const task = TaskModel.create({ title: 'Urgent Task', status: 'in-progress', priority: 'high', userId: 'u1' });
      expect(task.status).toBe('in-progress');
      expect(task.priority).toBe('high');
    });
    it('should assign a unique uuid to each task', () => {
      const t1 = TaskModel.create({ title: 'Task 1', userId: 'u1' });
      const t2 = TaskModel.create({ title: 'Task 2', userId: 'u1' });
      expect(t1.id).not.toBe(t2.id);
    });
    it('should set createdAt and updatedAt timestamps', () => {
      const task = TaskModel.create({ title: 'Timestamped', userId: 'u1' });
      expect(task.createdAt).toBeDefined();
      expect(task.updatedAt).toBeDefined();
    });
  });

  describe('getAll()', () => {
    it('should return empty array when no tasks exist', () => {
      expect(TaskModel.getAll()).toEqual([]);
    });
    it('should return all tasks', () => {
      TaskModel.create({ title: 'T1', userId: 'u1' });
      TaskModel.create({ title: 'T2', userId: 'u2' });
      expect(TaskModel.getAll().length).toBe(2);
    });
    it('should filter by status', () => {
      TaskModel.create({ title: 'Pending', status: 'pending', userId: 'u1' });
      TaskModel.create({ title: 'Done', status: 'completed', userId: 'u1' });
      const pending = TaskModel.getAll({ status: 'pending' });
      expect(pending.length).toBe(1);
      expect(pending[0].status).toBe('pending');
    });
    it('should filter by priority', () => {
      TaskModel.create({ title: 'High', priority: 'high', userId: 'u1' });
      TaskModel.create({ title: 'Low', priority: 'low', userId: 'u1' });
      expect(TaskModel.getAll({ priority: 'high' }).length).toBe(1);
    });
  });

  describe('getById()', () => {
    it('should return task by id', () => {
      const task = TaskModel.create({ title: 'Find Me', userId: 'u1' });
      expect(TaskModel.getById(task.id)).toEqual(task);
    });
    it('should return null for unknown id', () => {
      expect(TaskModel.getById('nonexistent-id')).toBeNull();
    });
  });

  describe('update()', () => {
    it('should update task fields', () => {
      const task = TaskModel.create({ title: 'Old Title', userId: 'u1' });
      const updated = TaskModel.update(task.id, { title: 'New Title', status: 'completed' });
      expect(updated.title).toBe('New Title');
      expect(updated.status).toBe('completed');
      expect(updated.id).toBe(task.id);
    });
    it('should return null for unknown id', () => {
      expect(TaskModel.update('bad-id', { title: 'Nope' })).toBeNull();
    });
    it('should update the updatedAt timestamp', (done) => {
      const task = TaskModel.create({ title: 'TS Task', userId: 'u1' });
      setTimeout(() => {
        const updated = TaskModel.update(task.id, { title: 'Updated' });
        expect(updated.updatedAt).not.toBe(task.updatedAt);
        done();
      }, 10);
    });
  });

  describe('delete()', () => {
    it('should delete a task and return true', () => {
      const task = TaskModel.create({ title: 'Delete Me', userId: 'u1' });
      expect(TaskModel.delete(task.id)).toBe(true);
      expect(TaskModel.getById(task.id)).toBeNull();
    });
    it('should return false for unknown id', () => {
      expect(TaskModel.delete('unknown')).toBe(false);
    });
  });
});