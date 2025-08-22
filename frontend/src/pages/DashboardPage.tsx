import React, { useState } from 'react';
import { Zap, MapPin, ListTodo, AlertTriangle, CheckCircle2, Wind, TrendingUp, Activity, Shield, Settings, Bell, Search } from 'lucide-react';

const PageLayout = ({ title, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage your transformer network</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search transformers..." 
              className="pl-10 pr-4 py-2 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <button className="relative p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  </div>
);

const DashboardPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const statsCards = [
    {
      title: "Total Transformers",
      value: "1,428",
      change: "+12%",
      icon: Zap,
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Active Units",
      value: "1,391",
      change: "+5%",
      icon: CheckCircle2,
      color: "green",
      bgGradient: "from-green-500 to-green-600"
    },
    {
      title: "Maintenance Due",
      value: "23",
      change: "-8%",
      icon: Settings,
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600"
    },
    {
      title: "Critical Alerts",
      value: "14",
      change: "+15%",
      icon: AlertTriangle,
      color: "red",
      bgGradient: "from-red-500 to-red-600"
    }
  ];

  const notifications = [
    {
      type: "critical",
      title: "Temperature Threshold Exceeded",
      description: "Transformer AZ-8070 has exceeded the temperature threshold.",
      time: "Mon(21), May, 2023 12:55pm",
      icon: AlertTriangle,
      color: "red"
    },
    {
      type: "warning",
      title: "Scheduled Maintenance Due",
      description: "Transformer BX-4521 requires routine maintenance check.",
      time: "Mon(21), May, 2023 11:30am",
      icon: Settings,
      color: "orange"
    },
    {
      type: "success",
      title: "System Restored",
      description: "Transformer CY-9012 has been successfully restored to operation.",
      time: "Mon(21), May, 2023 10:15am",
      icon: CheckCircle2,
      color: "green"
    },
    {
      type: "info",
      title: "Load Optimization Complete",
      description: "Network load balancing has been optimized for peak efficiency.",
      time: "Mon(21), May, 2023 09:45am",
      icon: TrendingUp,
      color: "blue"
    }
  ];

  const transformers = [
    { id: "AZ-8070", status: "Critical", load: 95, temperature: 78, location: "North Grid" },
    { id: "BX-4521", status: "Warning", load: 82, temperature: 65, location: "East Grid" },
    { id: "CY-9012", status: "Optimal", load: 67, temperature: 58, location: "South Grid" },
    { id: "DW-3456", status: "Optimal", load: 71, temperature: 62, location: "West Grid" },
    { id: "EX-7890", status: "Maintenance", load: 0, temperature: 45, location: "Central Grid" }
  ];

  return (
    <PageLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transformer List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Transformer Status Overview</h2>
                <div className="flex space-x-2">
                  {['24h', '7d', '30d'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTimeframe === timeframe
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {transformers.map((transformer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        transformer.status === 'Critical' ? 'bg-red-500' :
                        transformer.status === 'Warning' ? 'bg-orange-500' :
                        transformer.status === 'Maintenance' ? 'bg-gray-500' :
                        'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-semibold text-gray-900">{transformer.id}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {transformer.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Load: {transformer.load}%</p>
                      <p className="text-sm text-gray-500">Temp: {transformer.temperature}°C</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      transformer.status === 'Critical' ? 'bg-red-100 text-red-700' :
                      transformer.status === 'Warning' ? 'bg-orange-100 text-orange-700' :
                      transformer.status === 'Maintenance' ? 'bg-gray-100 text-gray-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {transformer.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200">
                <Activity className="text-blue-600 mb-2" size={24} />
                <span className="text-sm font-medium text-blue-700">System Health</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200">
                <Shield className="text-green-600 mb-2" size={24} />
                <span className="text-sm font-medium text-green-700">Security Status</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-200">
                <Settings className="text-orange-600 mb-2" size={24} />
                <span className="text-sm font-medium text-orange-700">Maintenance</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                <TrendingUp className="text-purple-600 mb-2" size={24} />
                <span className="text-sm font-medium text-purple-700">Analytics</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Notifications</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className={`p-2 rounded-full mt-1 ${
                      notification.color === 'red' ? 'bg-red-100' :
                      notification.color === 'orange' ? 'bg-orange-100' :
                      notification.color === 'green' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      <notification.icon className={`${
                        notification.color === 'red' ? 'text-red-600' :
                        notification.color === 'orange' ? 'text-orange-600' :
                        notification.color === 'green' ? 'text-green-600' :
                        'text-blue-600'
                      }`} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${
                        notification.color === 'red' ? 'text-red-700' :
                        notification.color === 'orange' ? 'text-orange-700' :
                        notification.color === 'green' ? 'text-green-700' :
                        'text-blue-700'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;