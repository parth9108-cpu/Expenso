import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import ExpenseForm from './components/Expense/ExpenseForm';
import ExpenseList from './components/Expense/ExpenseList';
import PendingApprovals from './components/Manager/PendingApprovals';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && (
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center space-x-8">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Expenso MVP
                  </h1>
                  <div className="hidden md:flex space-x-6">
                    <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="/expenses" className="text-sm text-gray-600 hover:text-gray-900">Expenses</a>
                    {user.role === 'employee' && (
                      <a href="/expenses/new" className="text-sm text-gray-600 hover:text-gray-900">Add Expense</a>
                    )}
                    {(user.role === 'manager' || user.role === 'admin') && (
                      <a href="/approvals" className="text-sm text-gray-600 hover:text-gray-900">Approvals</a>
                    )}
                    {(user.role === 'admin' || user.role === 'manager') && (
                      <a href="/analytics" className="text-sm text-gray-600 hover:text-gray-900">Analytics</a>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.role === 'employee' && `Welcome, ${user.name} (employee)`}
                    {user.role === 'manager' && `Welcome, ${user.name} (manager)`}
                    {user.role === 'admin' && `Welcome, Admin`}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Signup onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/expenses" 
            element={
              user ? <ExpenseList user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/expenses/new" 
            element={
              user ? <ExpenseForm user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/approvals" 
            element={
              user && (user.role === 'manager' || user.role === 'admin') ? 
              <PendingApprovals user={user} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/analytics" 
            element={
              user && (user.role === 'admin' || user.role === 'manager') ? 
              <AnalyticsDashboard user={user} /> : 
              <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
