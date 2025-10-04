import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  getCountries: () => api.get('/auth/countries'),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
};

// Expenses API
export const expensesAPI = {
  createExpense: (expenseData) => api.post('/expenses', expenseData),
  getExpenses: () => api.get('/expenses'),
  getExpense: (id) => api.get(`/expenses/${id}`),
  approveExpense: (id, decision, comment) => 
    api.post(`/expenses/${id}/approve`, { decision, comment }),
};

// Integration API
export const integrationAPI = {
  getCountries: () => api.get('/integration/countries'),
  getExchangeRates: (base = 'USD') => api.get(`/integration/exchange?base=${base}`),
};

export default api;

