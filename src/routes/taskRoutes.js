const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { optionalAuth } = require('../middleware/auth');

router.get('/stats', taskController.getStats);
router.get('/', optionalAuth, taskController.getAllTasks);
router.get('/:id', optionalAuth, taskController.getTaskById);
router.post('/', optionalAuth, taskController.createTask);
router.put('/:id', optionalAuth, taskController.updateTask);
router.delete('/:id', optionalAuth, taskController.deleteTask);

module.exports = router;