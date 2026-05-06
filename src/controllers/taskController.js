const TaskModel = require('../models/taskModel');
const logger = require('../middleware/logger');

const taskController = {
  getAllTasks: (req, res) => {
    try {
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        userId: req.query.userId
      };
      const tasks = TaskModel.getAll(filters);
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err) {
      logger.error('getAllTasks error:', err);
      res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
  },

  getTaskById: (req, res) => {
    const task = TaskModel.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, data: task });
  },

  createTask: (req, res) => {
    try {
      const { title, description, status, priority, dueDate, tags } = req.body;
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
      }
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
      const validPriorities = ['low', 'medium', 'high'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      }
      if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({ error: `Priority must be one of: ${validPriorities.join(', ')}` });
      }
      const task = TaskModel.create({
        title: title.trim(),
        description, status, priority, dueDate, tags,
        userId: req.user ? req.user.id : 'anonymous'
      });
      logger.info(`Task created: ${task.id}`);
      res.status(201).json({ success: true, data: task });
    } catch (err) {
      logger.error('createTask error:', err);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  updateTask: (req, res) => {
    const task = TaskModel.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const updated = TaskModel.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  },

  deleteTask: (req, res) => {
    const task = TaskModel.getById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    TaskModel.delete(req.params.id);
    res.json({ success: true, message: 'Task deleted successfully' });
  },

  getStats: (req, res) => {
    const all = TaskModel.getAll();
    const stats = {
      total: all.length,
      byStatus: {
        pending: all.filter(t => t.status === 'pending').length,
        'in-progress': all.filter(t => t.status === 'in-progress').length,
        completed: all.filter(t => t.status === 'completed').length,
        cancelled: all.filter(t => t.status === 'cancelled').length
      },
      byPriority: {
        low: all.filter(t => t.priority === 'low').length,
        medium: all.filter(t => t.priority === 'medium').length,
        high: all.filter(t => t.priority === 'high').length
      }
    };
    res.json({ success: true, data: stats });
  }
};

module.exports = taskController;