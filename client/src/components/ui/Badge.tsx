import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'error' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    info: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    default: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string, isLate?: boolean, statusDisplay?: string }> = ({ status, isLate, statusDisplay }) => {
  if (statusDisplay === 'completed_late') {
    return <Badge variant="warning">Completed Late</Badge>;
  }
  if (isLate) {
    return <Badge variant="error">Late</Badge>;
  }
  if (status === 'completed') return <Badge variant="success">Completed</Badge>;
  if (status === 'pending') return <Badge variant="warning">Pending</Badge>;
  if (status === 'active') return <Badge variant="info">Active</Badge>;
  
  return <Badge>{status}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  if (priority === 'high') return <Badge variant="error">High</Badge>;
  if (priority === 'medium') return <Badge variant="warning">Medium</Badge>;
  if (priority === 'low') return <Badge variant="info">Low</Badge>;
  
  return <Badge>{priority}</Badge>;
};
