import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      {/* We make the main area a flex container itself */}
      <main className="flex-1 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;