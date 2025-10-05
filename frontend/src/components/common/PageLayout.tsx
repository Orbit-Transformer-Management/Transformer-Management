import React from "react";
import { Bell, User } from "lucide-react";


interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex-1 flex flex-col bg-white p-8 rounded-2xl shadow-lg border border-gray-100">

      {/* Header */}
      <header className="flex-shrink-0 flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        {/* Top */}
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 bg-clip-text text-transparent">
          {title}
        </h1>

        <div className="flex items-center space-x-6">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-gray-200 transition-colors">
            <Bell size={22} className="text-white" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-white px-3 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-500 flex items-center justify-center shadow-sm">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">
                Shaveen Herath
              </p>
              <p className="text-xs text-gray-500">
                herathshaveen@gmail.com
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
