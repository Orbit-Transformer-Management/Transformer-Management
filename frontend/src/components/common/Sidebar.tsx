import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return `group relative flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${
      isActive
        ? 'bg-gray-300 text-gray-900 shadow-sm'
        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
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
    <aside
      className={`relative ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white text-gray-800 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 flex flex-col">
        <div className="flex items-center justify-between">
          {/* Logo + Name */}
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 bg-gray-400 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">O</span>
            </div>
          {!isCollapsed && (
            <h1 className="text-lg font-bold tracking-wide font-serif text-gray-800">
              Orbit
            </h1>
          )}

          </div>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="mt-5 p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gray-400 rounded-full flex items-center justify-center shadow-sm">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john@example.com</p>
              </div>
              <div className="relative">
                <Bell size={16} className="text-gray-500" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
            Main Menu
          </h2>
        )}

        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
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
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {/* Collapse Toggle - vertically centered */}
<button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className="absolute top-1/2 -translate-y-1/2 right-0 z-20 bg-transparent border-none p-0 m-0"
  style={{ background: "transparent", border: "none" }}
>
  {isCollapsed ? (
    <ChevronRight size={20} className="stroke-gray-400" />
  ) : (
    <ChevronLeft size={20} className="stroke-gray-400" />
  )}
</button>



      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
            Support
          </h2>
        )}

        {bottomItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
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
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          className={`w-full group relative flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out text-gray-700 hover:bg-red-100 hover:text-red-600 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className={`${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} size={20} />
          {!isCollapsed && <span className="truncate">Sign Out</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
