import express from 'express';
import { getTasks, getMyTasks, createTask, getTaskById, updateTask, deleteTask } from '../controllers/taskController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/my-tasks', getMyTasks);

router.route('/')
  .get(adminOnly, getTasks)
  .post(adminOnly, createTask);

router.route('/:id')
  .get(getTaskById)
  .patch(updateTask)
  .delete(adminOnly, deleteTask);

export default router;
