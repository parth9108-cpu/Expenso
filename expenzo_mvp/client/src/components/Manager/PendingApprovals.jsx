import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import { expensesAPI } from '../../services/api';
import ApproveModal from './ApproveModal';

const PendingApprovals = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await expensesAPI.getExpenses();
      // Filter for expenses that need approval from this user
      const pendingExpenses = response.data.filter(expense => {
        if (expense.status !== 'pending') return false;
        
        const userApproval = expense.approvers.find(
          approver => approver.userId._id === user.id && approver.decision === 'pending'
        );
        return userApproval;
      });
      
      setExpenses(pendingExpenses);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId, decision, comment) => {
    try {
      await expensesAPI.approveExpense(expenseId, decision, comment);
      setShowModal(false);
      setSelectedExpense(null);
      fetchPendingApprovals(); // Refresh the list
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  const openModal = (expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€' };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">Loading pending approvals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="mt-2 text-gray-600">
            Review and approve expenses that require your attention.
          </p>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              All expenses have been processed or no approvals are required at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
              <div key={expense._id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {expense.employeeId.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.employeeId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.employeeId.email}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amountOriginal, expense.currencyOriginal)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {expense.description}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>{expense.category}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {expense.extractedFields && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="text-xs font-medium text-gray-700 mb-2">OCR Extracted:</div>
                      <div className="text-xs text-gray-600">
                        <div>Merchant: {expense.extractedFields.merchant}</div>
                        {expense.extractedFields.confidences && (
                          <div className="mt-1">
                            <div className="flex items-center space-x-2">
                              <span>Confidence:</span>
                              <div className="flex space-x-1">
                                {Object.entries(expense.extractedFields.confidences).map(([field, confidence]) => (
                                  <span
                                    key={field}
                                    className={`px-1 py-0.5 rounded text-xs ${
                                      confidence >= 80 ? 'bg-green-100 text-green-800' :
                                      confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {field}: {confidence}%
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => openModal(expense)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(expense._id, 'approved', 'Approved')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(expense._id, 'rejected', 'Rejected')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedExpense && (
          <ApproveModal
            expense={selectedExpense}
            onClose={() => {
              setShowModal(false);
              setSelectedExpense(null);
            }}
            onApprove={handleApproval}
          />
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;

