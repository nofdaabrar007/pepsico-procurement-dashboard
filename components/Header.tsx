
import React from 'react';
import { NavLink } from 'react-router-dom';
import { PepsiCoGlobeIcon } from './Icons.tsx';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <PepsiCoGlobeIcon className="h-9 w-9" />
            <span className="text-2xl font-bold text-gray-700">Procurement Dashboard</span>
          </div>
          <nav className="flex space-x-4">
            <NavLink 
              to="/upload" 
              className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Upload
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Dashboard
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;