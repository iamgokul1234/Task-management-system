import express from 'express';
import { loginUser, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
