import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tasks/my-tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load your tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openUpdateModal = (task: any) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newStatus) return;

    setIsSubmitting(true);
    try {
      const response = await api.patch(`/tasks/${selectedTask._id}`, { status: newStatus });
      if (response.data.success) {
        toast.success('Task status updated');
        setIsModalOpen(false);
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickComplete = async (taskId: string) => {
    try {
      const response = await api.patch(`/tasks/${taskId}`, { status: 'completed' });
      if (response.data.success) {
        toast.success('Task marked as completed!');
        fetchTasks();
      }
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">View and update the status of your assigned tasks.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading your tasks...</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Task</TableHeader>
                  <TableHeader className="hidden md:table-cell">Assigned By</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Priority</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Due Date</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <div className="font-medium text-slate-900 leading-snug">{task.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-[150px] sm:max-w-xs" title={task.description}>
                          {task.description}
                        </div>
                        {/* Due date shown inline on mobile */}
                        <div className="mt-0.5 sm:hidden">
                          <span className={`text-xs ${task.isLate ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{task.assignedBy?.name}</TableCell>
                      <TableCell className="hidden sm:table-cell"><PriorityBadge priority={task.priority} /></TableCell>
                      <TableCell><StatusBadge status={task.status} isLate={task.isLate} statusDisplay={task.statusDisplay} /></TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className={`whitespace-nowrap ${task.isLate ? 'text-red-600 font-medium' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openUpdateModal(task)}
                            disabled={task.status === 'completed'}
                          >
                            Update
                          </Button>
                          {task.status !== 'completed' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => quickComplete(task._id)}
                              title="Mark as Completed"
                              className="px-2 bg-green-600 hover:bg-green-700 shrink-0"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      You have no tasks assigned to you.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Update Task Status">
        {selectedTask && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
              <h4 className="font-medium text-slate-900">{selectedTask.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{selectedTask.description}</p>
              <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
              </div>
            </div>

            <Select
              label="New Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">Update Status</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
