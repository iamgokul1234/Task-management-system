import express from 'express';
import { getAdminDashboardStats, getEmployeeDashboardStats } from '../controllers/dashboardController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/admin', adminOnly, getAdminDashboardStats);
router.get('/employee', getEmployeeDashboardStats);

export default router;
