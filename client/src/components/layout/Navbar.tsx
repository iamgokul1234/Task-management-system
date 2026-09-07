import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar = ({ onMenuClick }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
      <div className="flex items-center">
        <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
        <div className="flex min-w-0 items-center space-x-2 text-slate-700">
          <div className="bg-primary-100 p-1.5 rounded-full text-primary-600">
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="max-w-28 truncate text-sm font-medium leading-none sm:max-w-none">{user?.name}</span>
            <span className="mt-1 text-xs capitalize text-slate-500">{user?.role}</span>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-600 transition-colors flex items-center space-x-1 p-2 rounded-md hover:bg-slate-50"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
