import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Users, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        if (response.data.success) {
          setStats(response.data.data.stats);
          setRecentTasks(response.data.data.recentTasks);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-slate-200 rounded-full mr-4" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-200 rounded mb-2" />
                  <div className="h-6 w-12 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { title: 'Active Tasks', value: stats?.activeTasks || 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { title: 'Late Tasks', value: stats?.lateTasks || 0, icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of the system's performance and status.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-4 sm:p-6">
              <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color} mr-4 shrink-0`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 truncate">{stat.title}</p>
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card>
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-medium leading-6 text-slate-900">Recent Tasks</h3>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Task</TableHeader>
                <TableHeader className="hidden sm:table-cell">Assigned To</TableHeader>
                <TableHeader className="hidden md:table-cell">Priority</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="hidden lg:table-cell">Due Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      <div className="font-medium text-slate-900 leading-snug">{task.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-[180px] sm:max-w-xs">{task.description}</div>
                      {/* Show assignee inline on mobile */}
                      <div className="text-xs text-slate-400 mt-0.5 sm:hidden">{task.assignedTo?.name || 'Unassigned'}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{task.assignedTo?.name || 'Unassigned'}</TableCell>
                    <TableCell className="hidden md:table-cell"><PriorityBadge priority={task.priority} /></TableCell>
                    <TableCell><StatusBadge status={task.status} isLate={task.isLate} statusDisplay={task.statusDisplay} /></TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center py-8 text-slate-500" colSpan={5}>
                    No recent tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
