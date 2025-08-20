import React from 'react';
import PageLayout from '../components/common/PageLayout';
import { Zap, MapPin, ListTodo, AlertTriangle, CheckCircle2, Wind } from 'lucide-react';

const DashboardPage = () => {
  return (
    <PageLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats Card Example */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Transformers</p>
            <p className="text-2xl font-bold">1428</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Zap className="text-blue-500" size={20}/>
          </div>
        </div>
        {/* Add other stats cards similarly */}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Currently Operational Transformers</h2>
          <p className="text-gray-600">Transformer list placeholder...</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          <div className="space-y-4">
            {/* Notification Item Example */}
            <div className="flex items-start space-x-3">
              <div className="bg-red-100 p-2 rounded-full mt-1">
                <AlertTriangle className="text-red-500" size={20}/>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm">Temperature Threshold Exceeded</p>
                <p className="text-xs text-gray-600">Transformer AZ-8070 has exceeded the temperature threshold.</p>
                <p className="text-xs text-gray-400 mt-1">Mon(21), May, 2023 12.55pm</p>
              </div>
            </div>
            {/* Add other notifications */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;