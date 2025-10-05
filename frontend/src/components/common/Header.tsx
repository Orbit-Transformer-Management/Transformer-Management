import React from 'react';
import { Bell, Settings, User } from 'lucide-react';
import "./header.css"

// Define the types for the component's props
interface HeaderProps {
  title: string;
  breadcrumb: string;
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumb }) => {
  return (
    <header className=" pagehe bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500">{breadcrumb}</p>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600 hover:text-gray-800">
            <Bell size={24} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="text-gray-600 hover:text-white">
            <Settings size={24} />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
             <User size={24} className="text-gray-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Shveen Herath</p>
            <p className="text-sm text-gray-500">herathshaveen@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;