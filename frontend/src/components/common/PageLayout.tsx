import React from 'react';
import { Bell, User } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    // This container now grows to fill the main area
    <div className="flex-1 flex flex-col p-6">
      {/* Top header part */}
      <header className="flex-shrink-0 flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">= {title}</h1>
        <div className="flex items-center space-x-4">
          <button className="relative text-gray-600">
            <Bell size={24} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Shaheen Herath</p>
              <p className="text-xs text-gray-500">herathshaheen@gmail.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content card also grows to fill the remaining space */}
      <div className="flex-1 flex flex-col bg-white p-6 rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;