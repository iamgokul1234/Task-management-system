import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  assignedTo: z.string().min(1, 'Please select an employee'),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.string().min(1, 'Start date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
}).refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
  message: "Due date cannot be before start date",
  path: ["dueDate"],
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks', { params: { status: statusFilter, priority: priorityFilter } }),
        api.get('/users')
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (usersRes.data.success) {
        // Only active employees can be assigned new tasks
        setEmployees(usersRes.data.data.filter((u: any) => u.isActive));
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/tasks', data);
      if (response.data.success) {
        if (response.data.emailSent) {
          toast.success('Task created and email sent successfully');
        } else {
          toast.success('Task created, but email failed to send');
        }
        setIsModalOpen(false);
        reset();
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and assign tasks across the team.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Assign Task
        </Button>
      </div>

      <Card>
        {/* Filters */}
        <div className="px-4 py-4 sm:px-6 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center text-sm font-medium text-slate-500">
              <Filter className="h-4 w-4 mr-1.5" /> Filters:
            </div>
            <div className="flex flex-1 flex-wrap gap-3">
              <Select
                wrapperClassName="w-full sm:w-40"
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
              <Select
                wrapperClassName="w-full sm:w-40"
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading tasks...</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Task</TableHeader>
                  <TableHeader className="hidden sm:table-cell">Assigned To</TableHeader>
                  <TableHeader className="hidden md:table-cell">Priority</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="hidden lg:table-cell">Timeline</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <div className="font-medium text-slate-900 leading-snug">{task.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-[180px] sm:max-w-xs" title={task.description}>
                          {task.description}
                        </div>
                        {/* Show assignee inline on mobile */}
                        <div className="text-xs text-slate-400 mt-0.5 sm:hidden">{task.assignedTo?.name || 'Unassigned'}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{task.assignedTo?.name || 'Unassigned'}</TableCell>
                      <TableCell className="hidden md:table-cell"><PriorityBadge priority={task.priority} /></TableCell>
                      <TableCell><StatusBadge status={task.status} isLate={task.isLate} statusDisplay={task.statusDisplay} /></TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-xs text-slate-500">
                          <div>Start: {new Date(task.startDate).toLocaleDateString()}</div>
                          <div className={task.isLate ? 'text-red-600 font-medium' : ''}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No tasks found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="E.g., Update Marketing Deck"
            {...register('title')}
            error={errors.title?.message}
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border px-3 py-2 resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              rows={3}
              {...register('description')}
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Assign To + Priority — collapse to single col on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assign To"
              options={[
                { value: '', label: 'Select Employee...' },
                ...employees.map(emp => ({ value: emp._id, label: emp.name }))
              ]}
              {...register('assignedTo')}
              error={errors.assignedTo?.message}
            />
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
              {...register('priority')}
              error={errors.priority?.message}
            />
          </div>

          {/* Dates — collapse to single col on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              type="date"
              label="Due Date"
              {...register('dueDate')}
              error={errors.dueDate?.message}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">Assign Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
