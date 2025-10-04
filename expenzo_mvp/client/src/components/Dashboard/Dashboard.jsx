import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Users, BarChart3 } from 'lucide-react';

const Dashboard = ({ user }) => {
  const getQuickActions = () => {
    const actions = [];
    if (user.role === 'employee') {
      actions.push({
        title: 'Add Expense',
        description: 'Create a new expense entry',
        icon: Plus,
        link: '/expenses/new',
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }
    actions.push({
      title: 'View Expenses',
      description: 'See all your expenses',
      icon: FileText,
      link: '/expenses',
      color: 'bg-green-500 hover:bg-green-600'
    });
    if (user.role === 'manager' || user.role === 'admin') {
      actions.push({
        title: 'Pending Approvals',
        description: 'Review expenses for approval',
        icon: CheckCircle,
        link: '/approvals',
        color: 'bg-yellow-500 hover:bg-yellow-600'
      });
    }
    if (user.role === 'admin' || user.role === 'manager') {
      actions.push({
        title: 'Analytics Dashboard',
        description: 'View spend patterns and insights',
        icon: BarChart3,
        link: '/analytics',
        color: 'bg-indigo-500 hover:bg-indigo-600'
      });
    }
    if (user.role === 'admin') {
      actions.push({
        title: 'Manage Users',
        description: 'Add employees and managers',
        icon: Users,
        link: '/admin/users/add',
        color: 'bg-purple-500 hover:bg-purple-600'
      });
    }
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          {user.role === 'employee' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="mt-2 text-gray-600">Manage your expenses and approvals from your dashboard.</p>
            </>
          )}
          {user.role === 'manager' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="mt-2 text-gray-600">Items waiting for your review.</p>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, Admin</h1>
              <p className="mt-2 text-gray-600">Company: <span className="font-semibold">{user.company?.name || 'Loading...'}</span> — Base currency: <span className="font-semibold">{user.company?.baseCurrency || 'USD'}</span></p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(getQuickActions()) && getQuickActions().map((action, index) => {
            if (!action || typeof action !== 'object') return null;
            const IconComponent = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className={`${action.color} rounded-lg p-6 text-white transition-colors duration-200`}
              >
                <div className="flex items-center">
                  <IconComponent className="h-8 w-8 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">{String(action.title)}</h3>
                    <p className="text-sm opacity-90">{String(action.description)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity section removed as it's not part of MVP */}
      </div>
    </div>
  );
};

export default Dashboard;
