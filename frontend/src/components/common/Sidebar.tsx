import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Settings, ChevronLeft, ChevronRight, User, Bell, HelpCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `group relative flex items-center p-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
    }`;
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transformers', icon: Zap, label: 'Transformer' },
  ];

  const bottomItems = [
    { path: '/help', icon: HelpCircle, label: 'Help & Support' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out relative`}>
      {/* Header */}
      <div className="relative p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Orbit
              </h1>
            )}
          </div>
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={16} className="text-gray-500" />
            ) : (
              <ChevronLeft size={16} className="text-gray-500" />
            )}
          </button>
        </div>
        
        {/* User Profile */}
        {!isCollapsed && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john@example.com</p>
              </div>
              <div className="relative">
                <Bell size={16} className="text-gray-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className={`${isCollapsed ? 'hidden' : 'block'} mb-4`}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3">
            Main Menu
          </h2>
        </div>
        
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={getNavLinkClass}
          >
            <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} size={20} />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} />
                </div>
              </>
            )}
            
            {/* Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className={`${isCollapsed ? 'hidden' : 'block'} mb-4`}>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3">
            Support
          </h2>
        </div>
        
        {bottomItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={getNavLinkClass}
          >
            <item.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} size={20} />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} />
                </div>
              </>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
        
        {/* Logout */}
        <button className={`w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 ease-in-out text-gray-600 hover:bg-red-50 hover:text-red-600 ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut className={`${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} size={20} />
          {!isCollapsed && <span className="truncate">Sign Out</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
