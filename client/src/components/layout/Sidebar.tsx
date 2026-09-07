import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, CheckSquare, CheckCircle, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employees', to: '/admin/employees', icon: Users },
    { name: 'Tasks', to: '/admin/tasks', icon: CheckSquare },
  ];

  const employeeLinks = [
    { name: 'Dashboard', to: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', to: '/employee/tasks', icon: CheckCircle },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {/* Backdrop overlay */}
      <button
        aria-label="Close navigation"
        className={`fixed inset-0 z-30 bg-slate-900/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-4 md:justify-center md:px-0">
          <Link
            to={isAdmin ? '/admin/dashboard' : '/employee/dashboard'}
            className="text-xl font-bold text-white tracking-wide hover:opacity-80 transition-opacity"
            onClick={onClose}
          >
            Task<span className="text-primary-500">Master</span>
          </Link>
          <button
            className="rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <link.icon className="mr-3 h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
