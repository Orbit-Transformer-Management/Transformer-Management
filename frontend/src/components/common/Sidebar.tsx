import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Settings } from 'lucide-react'; // Import the new icon

const Sidebar = () => {
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `flex items-center p-3 rounded-lg transition-colors text-sm font-semibold ${
      isActive
        ? 'bg-blue-100 text-blue-600'
        : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  return (
    <aside className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 text-2xl font-bold text-gray-800 border-b">
        Orbit
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Added Dashboard NavLink */}
        <NavLink to="/dashboard" className={getNavLinkClass}>
          <LayoutDashboard className="mr-3" size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/transformers" className={getNavLinkClass}>
          <Zap className="mr-3" size={20} />
          <span>Transformer</span>
        </NavLink>
      </nav>
      <div className="p-4 border-t">
        <NavLink to="/settings" className={getNavLinkClass}>
          <Settings className="mr-3" size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;