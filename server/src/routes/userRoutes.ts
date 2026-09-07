import express from 'express';
import { getUsers, getUserById, createUser, updateUser } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .patch(updateUser);

export default router;
