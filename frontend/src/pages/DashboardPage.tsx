import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, ListTodo, AlertTriangle, CheckCircle2, Wind, TrendingUp, Activity, Shield, Settings, Bell, Search, Plus, ChevronLeft, Filter, Calendar, Clock, Eye, Star, MoreVertical } from 'lucide-react';
import PageLayout from '../components/common/PageLayout';

const DashboardPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const navigate = useNavigate();

  const statsCards = [
    {
      title: "Total Transformers",
      value: "1,428",
      change: "+12%",
      icon: Zap,
      color: "blue",
      bgGradient: "from-blue-50 via-blue-100 to-indigo-100",
      iconBg: "bg-blue-200",
      textColor: "text-blue-800",
      changeColor: "bg-green-100 text-green-600"
    },
    {
      title: "Active Units",
      value: "1,391",
      change: "+5%",
      icon: CheckCircle2,
      color: "green",
      bgGradient: "from-emerald-50 via-green-100 to-teal-100",
      iconBg: "bg-green-200",
      textColor: "text-green-800",
      changeColor: "bg-green-100 text-green-600"
    },
    {
      title: "Maintenance Due",
      value: "23",
      change: "-8%",
      icon: Settings,
      color: "orange",
      bgGradient: "from-amber-50 via-yellow-100 to-orange-100",
      iconBg: "bg-amber-200",
      textColor: "text-amber-800",
      changeColor: "bg-red-100 text-red-600"
    },
    {
      title: "Critical Alerts",
      value: "14",
      change: "+15%",
      icon: AlertTriangle,
      color: "red",
      bgGradient: "from-red-50 via-pink-100 to-rose-100",
      iconBg: "bg-red-200",
      textColor: "text-red-800",
      changeColor: "bg-red-100 text-red-600"
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
      <div className="flex flex-col h-full space-y-8">

        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
          <div className="relative p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg">
                    <Activity size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">
                      System Dashboard
                    </h1>
                    <p className="text-lg mt-2 font-medium text-gray-700">
                      Monitor and control electrical infrastructure
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Tab Navigation */}
              <div className="flex items-center bg-white/90 p-2 rounded-2xl shadow-lg border border-amber-200 backdrop-blur-sm">
                <button 
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg text-lg font-bold transition-all duration-300 flex items-center space-x-2"
                >
                  <Activity size={18} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => navigate('/transformers')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-blue-400/20"
                >
                  <Zap size={18} />
                  <span>Transformers</span>
                </button>
                <button
                  onClick={() => navigate('/inspections')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 text-white rounded-xl text-lg font-semibold hover:from-blue-600 hover:via-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-blue-400/20"
                >
                  <ListTodo size={18} />
                  <span>Inspections</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border-2 border-${stat.color}-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm font-bold uppercase tracking-wide`}>{stat.title}</p>
                  <p className={`text-4xl font-black ${stat.textColor} mt-2`}>{stat.value}</p>
                  <p className={`${stat.textColor} text-xs mt-1 font-medium flex items-center`}>
                    {stat.change.startsWith('+') ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 rotate-180" />}
                    {stat.title === "Total Transformers" ? "Active Units" : 
                     stat.title === "Active Units" ? "Running Smoothly" :
                     stat.title === "Maintenance Due" ? "Needs Attention" : "System Alerts"}
                  </p>
                </div>
                <div className={`p-4 ${stat.iconBg} rounded-2xl shadow-inner`}>
                  <stat.icon size={32} className={stat.textColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enhanced Transformer List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 via-gray-100 to-slate-50 px-8 py-6 border-b-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <div className="p-3 bg-amber-100 rounded-xl mr-4">
                      <Zap size={24} className="text-amber-600" />
                    </div>
                    Transformer Status Overview
                  </h3>
                  <div className="flex items-center bg-white/90 p-2 rounded-2xl shadow-lg border border-gray-200 backdrop-blur-sm">
                    {['24h', '7d', '30d'].map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setSelectedTimeframe(timeframe)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                          selectedTimeframe === timeframe
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-4">
                  {transformers.map((transformer, index) => (
                    <div key={index} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:from-amber-50 hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100">
                      <div className="flex items-center space-x-6">
                        <div className={`w-4 h-4 rounded-full shadow-lg ${
                          transformer.status === 'Critical' ? 'bg-red-500 animate-pulse' :
                          transformer.status === 'Warning' ? 'bg-orange-500' :
                          transformer.status === 'Maintenance' ? 'bg-gray-500' :
                          'bg-green-500'
                        }`}></div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap size={20} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-800 group-hover:text-amber-600 transition-colors">{transformer.id}</p>
                            <p className="text-sm text-gray-500 flex items-center font-medium">
                              <MapPin size={14} className="mr-2" />
                              {transformer.location}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 mb-1">Load: {transformer.load}%</p>
                          <p className="text-sm text-gray-600 font-medium">Temp: {transformer.temperature}°C</p>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${
                          transformer.status === 'Critical' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300' :
                          transformer.status === 'Warning' ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300' :
                          transformer.status === 'Maintenance' ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300' :
                          'bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 border-green-300'
                        }`}>
                          {transformer.status}
                        </div>

                        <button className="inline-flex items-center bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
                          <Eye size={16} className="mr-2" />
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            
            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-xl mr-3">
                    <Settings size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 border-2 border-blue-200">
                    <div className="p-3 bg-blue-200 rounded-xl mb-3 group-hover:bg-blue-300 transition-colors">
                      <Activity className="text-blue-800" size={24} />
                    </div>
                    <span className="text-sm font-bold text-blue-800">System Health</span>
                  </button>
                  
                  <button className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 border-2 border-green-200">
                    <div className="p-3 bg-green-200 rounded-xl mb-3 group-hover:bg-green-300 transition-colors">
                      <Shield className="text-green-800" size={24} />
                    </div>
                    <span className="text-sm font-bold text-green-800">Security Status</span>
                  </button>
                  
                  <button className="group flex flex-col items-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 border-2 border-amber-200">
                    <div className="p-3 bg-amber-200 rounded-xl mb-3 group-hover:bg-amber-300 transition-colors">
                      <Settings className="text-amber-800" size={24} />
                    </div>
                    <span className="text-sm font-bold text-amber-800">Maintenance</span>
                  </button>
                  
                  <button className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 border-2 border-purple-200">
                    <div className="p-3 bg-purple-200 rounded-xl mb-3 group-hover:bg-purple-300 transition-colors">
                      <TrendingUp className="text-purple-800" size={24} />
                    </div>
                    <span className="text-sm font-bold text-purple-800">Analytics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Notifications */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-slate-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-xl mr-3">
                      <Bell size={20} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Recent Notifications</h3>
                  </div>
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">4</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div key={index} className="group flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:from-amber-50 hover:to-orange-50 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100">
                      <div className={`p-3 rounded-2xl shadow-inner ${
                        notification.color === 'red' ? 'bg-red-100' :
                        notification.color === 'orange' ? 'bg-amber-100' :
                        notification.color === 'green' ? 'bg-green-100' :
                        'bg-blue-100'
                      }`}>
                        <notification.icon className={`${
                          notification.color === 'red' ? 'text-red-600' :
                          notification.color === 'orange' ? 'text-amber-600' :
                          notification.color === 'green' ? 'text-green-600' :
                          'text-blue-600'
                        }`} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm group-hover:text-amber-600 transition-colors ${
                          notification.color === 'red' ? 'text-red-700' :
                          notification.color === 'orange' ? 'text-amber-700' :
                          notification.color === 'green' ? 'text-green-700' :
                          'text-blue-700'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed font-medium">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-bold">
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
      </div>
    </PageLayout>
  );
};

export default DashboardPage;