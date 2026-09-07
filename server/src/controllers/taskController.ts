import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { sendEmail } from '../services/emailService';
import { formatTaskResponse } from '../utils/taskFormatter';
import { AuthRequest } from '../middleware/auth';

// @route   GET /api/tasks
// @desc    Get all tasks (Admin only) with filtering, pagination
// @access  Private/Admin
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await Task.countDocuments(query);

    const formattedTasks = tasks.map(formatTaskResponse);

    res.status(200).json({
      success: true,
      data: formattedTasks,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks assigned to logged-in user
// @access  Private
export const getMyTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ assignedTo: req.user?._id })
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });

    const formattedTasks = tasks.map(formatTaskResponse);
    res.status(200).json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   POST /api/tasks
// @desc    Create and assign a task
// @access  Private/Admin
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, assignedTo, priority, startDate, dueDate } = req.body;

  try {
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') {
      res.status(400).json({ success: false, message: 'Invalid employee assigned' });
      return;
    }

    if (!employee.isActive) {
      res.status(400).json({ success: false, message: 'Cannot assign task to deactivated employee' });
      return;
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user?._id,
      priority,
      startDate,
      dueDate,
    });

    // Send email asynchronously without blocking the response
    let emailSent = false;
    try {
      emailSent = await sendEmail({
        email: employee.email,
        subject: `New Task Assigned: ${title}`,
        message: `Hello ${employee.name},\n\nYou have been assigned a new task: "${title}".\nPriority: ${priority}\nDue Date: ${new Date(dueDate).toDateString()}\n\nDescription:\n${description}\n\nPlease log in to your dashboard to view details and update its status.\n\nBest,\nTask Management System`,
        html: `<p>Hello <strong>${employee.name}</strong>,</p>
               <p>You have been assigned a new task: <strong>${title}</strong>.</p>
               <ul>
                 <li><strong>Priority:</strong> ${priority}</li>
                 <li><strong>Due Date:</strong> ${new Date(dueDate).toDateString()}</li>
               </ul>
               <p><strong>Description:</strong></p>
               <p>${description}</p>
               <p>Please log in to your dashboard to view details and update its status.</p>`
      });
    } catch (emailErr) {
      console.error('Email sending failed during task creation', emailErr);
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      emailSent,
      data: formatTaskResponse(populatedTask)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Access control: if employee, they can only view their own tasks
    if (req.user?.role === 'employee' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this task' });
      return;
    }

    res.status(200).json({ success: true, data: formatTaskResponse(task) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   PATCH /api/tasks/:id
// @desc    Update task (Admin updates anything, Employee updates only status)
// @access  Private
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // If employee, only allow status updates for their own tasks
    if (req.user?.role === 'employee') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: 'Not authorized to update this task' });
        return;
      }
      
      const { status } = req.body;
      if (status && ['active', 'pending', 'completed'].includes(status)) {
        task.status = status;
        if (status === 'completed') {
          task.completedAt = new Date();
        } else {
          task.completedAt = undefined;
        }
      }
    } else if (req.user?.role === 'admin') {
      // Admin can update any field
      const { title, description, priority, startDate, dueDate, status, assignedTo } = req.body;
      
      if (title) task.title = title;
      if (description) task.description = description;
      if (priority) task.priority = priority;
      if (startDate) task.startDate = startDate;
      if (dueDate) task.dueDate = dueDate;
      if (assignedTo) task.assignedTo = assignedTo;
      if (status) {
        task.status = status;
        if (status === 'completed') {
          task.completedAt = task.completedAt || new Date();
        } else {
          task.completedAt = undefined;
        }
      }
    }

    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({ success: true, data: formatTaskResponse(updatedTask) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private/Admin
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
