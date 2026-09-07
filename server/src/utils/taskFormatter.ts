import { ITask } from '../models/Task';

export const formatTaskResponse = (task: any) => {
  const taskObj = typeof task.toObject === 'function' ? task.toObject() : task;
  
  const now = new Date();
  const dueDate = new Date(taskObj.dueDate);
  
  let isLate = false;
  let statusDisplay = taskObj.status;

  if (taskObj.status !== 'completed' && now > dueDate) {
    isLate = true;
  }
  
  if (taskObj.status === 'completed' && taskObj.completedAt && new Date(taskObj.completedAt) > dueDate) {
    statusDisplay = 'completed_late'; // Frontend can use this to show "Completed Late"
  }

  return {
    ...taskObj,
    isLate,
    statusDisplay
  };
};
