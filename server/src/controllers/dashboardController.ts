import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { formatTaskResponse } from '../utils/taskFormatter';

export const getAdminDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const allTasks = await Task.find();

    const stats = {
      totalEmployees,
      totalTasks: allTasks.length,
      activeTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      lateTasks: 0,
    };

    allTasks.forEach(task => {
      const formatted = formatTaskResponse(task);
      
      if (formatted.status === 'active') stats.activeTasks++;
      if (formatted.status === 'pending') stats.pendingTasks++;
      if (formatted.status === 'completed') stats.completedTasks++;
      if (formatted.isLate || formatted.statusDisplay === 'completed_late') {
        stats.lateTasks++;
      }
    });

    const recentTasks = await Task.find()
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentTasks: recentTasks.map(formatTaskResponse)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getEmployeeDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const myTasks = await Task.find({ assignedTo: req.user?._id });

    const stats = {
      activeTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      lateTasks: 0,
    };

    myTasks.forEach(task => {
      const formatted = formatTaskResponse(task);
      
      if (formatted.status === 'active') stats.activeTasks++;
      if (formatted.status === 'pending') stats.pendingTasks++;
      if (formatted.status === 'completed') stats.completedTasks++;
      if (formatted.isLate || formatted.statusDisplay === 'completed_late') {
        stats.lateTasks++;
      }
    });

    const recentTasks = await Task.find({ assignedTo: req.user?._id })
      .sort({ dueDate: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentTasks: recentTasks.map(formatTaskResponse)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
