const { v4: uuidv4 } = require('uuid');

let tasks = [];

const TaskModel = {
  getAll: (filters = {}) => {
    let result = [...tasks];
    if (filters.status) result = result.filter(t => t.status === filters.status);
    if (filters.priority) result = result.filter(t => t.priority === filters.priority);
    if (filters.userId) result = result.filter(t => t.userId === filters.userId);
    return result;
  },

  getById: (id) => tasks.find(t => t.id === id) || null,

  create: (data) => {
    const task = {
      id: uuidv4(),
      title: data.title,
      description: data.description || '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      userId: data.userId,
      dueDate: data.dueDate || null,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(task);
    return task;
  },

  update: (id, data) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = {
      ...tasks[index],
      ...data,
      id: tasks[index].id,
      userId: tasks[index].userId,
      createdAt: tasks[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    return tasks[index];
  },

  delete: (id) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  },

  _reset: () => { tasks = []; },
  _count: () => tasks.length
};

module.exports = TaskModel;