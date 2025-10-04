const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expenzo_mvp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  currencyCode: { type: String, required: true, default: 'USD' },
  approvalSequences: [{
    name: String,
    role: String,
    sequenceStep: Number
  }],
  conditionalRules: [{
    type: { type: String, enum: ['percentage', 'specific'] },
    threshold: Number,
    approverRole: String
  }]
}, { timestamps: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'employee', 'finance', 'director', 'cfo'], required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isManagerApprover: { type: Boolean, default: false }
}, { timestamps: true });

// Expense Schema
const expenseSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  amountOriginal: { type: Number, required: true },
  currencyOriginal: { type: String, required: true },
  amountCompanyCurrency: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  receiptImagePath: { type: String, default: null },
  extractedFields: {
    merchant: String,
    date: String,
    amount: String,
    taxLines: [String],
    confidences: {
      merchant: Number,
      amount: Number,
      date: Number
    }
  },
  approvers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    sequenceStep: Number,
    decision: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: String,
    decidedAt: Date
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const Company = mongoose.model('Company', companySchema);
const User = mongoose.model('User', userSchema);
const Expense = mongoose.model('Expense', expenseSchema);

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).populate('companyId');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get exchange rate
const getExchangeRate = async (from, to) => {
  try {
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`, {
      timeout: 5000
    });
    return response.data.rates[to] || 1;
  } catch (error) {
    console.error('Exchange rate error:', error.message);
    return 1;
  }
};

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Countries route
app.get('/api/auth/countries', async (req, res) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies', {
      timeout: 5000
    });
    const countries = response.data.map(country => ({
      name: country.name.common,
      code: country.cca2,
      currency: Object.keys(country.currencies || {})[0] || 'USD'
    }));
    res.json(countries);
  } catch (error) {
    console.error('Countries API error:', error.message);
    const fallbackCountries = [
      { name: 'India', code: 'IN', currency: 'INR' },
      { name: 'United States', code: 'US', currency: 'USD' },
      { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
      { name: 'Canada', code: 'CA', currency: 'CAD' },
      { name: 'Australia', code: 'AU', currency: 'AUD' }
    ];
    res.json(fallbackCountries);
  }
});

// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, country, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get currency for country
    let currencyCode = 'USD';
    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies', {
        timeout: 3000
      });
      const countryData = response.data.find(c => c.name.common === country);
      currencyCode = countryData ? Object.keys(countryData.currencies || {})[0] : 'USD';
    } catch (error) {
      const currencyMap = {
        'India': 'INR', 'United States': 'USD', 'United Kingdom': 'GBP',
        'Canada': 'CAD', 'Australia': 'AUD', 'Germany': 'EUR', 'France': 'EUR'
      };
      currencyCode = currencyMap[country] || 'USD';
    }

    // Create company
    const company = new Company({
      name: companyName,
      country,
      currencyCode,
      approvalSequences: [
        { name: 'Manager', role: 'manager', sequenceStep: 1 },
        { name: 'Finance', role: 'finance', sequenceStep: 2 }
      ],
      conditionalRules: [
        { type: 'percentage', threshold: 0.6 }
      ]
    });
    await company.save();

    // Create user
    const user = new User({
      name,
      email,
      passwordHash: password,
      role,
      companyId: company._id
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('companyId');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    }
  });
});

// Users routes
app.get('/api/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({ companyId: req.user.companyId })
      .select('-passwordHash')
      .populate('managerId', 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

app.post('/api/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { name, email, password, role, managerId, isManagerApprover } = req.body;

    const user = new User({
      name,
      email,
      passwordHash: password,
      role,
      companyId: req.user.companyId,
      managerId: managerId || null,
      isManagerApprover: isManagerApprover || false
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
      isManagerApprover: user.isManagerApprover
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create user' });
    }
  }
});

// Expenses routes
app.post('/api/expenses', auth, async (req, res) => {
  try {
    const { amountOriginal, currencyOriginal, category, description, date, receiptImagePath, extractedFields } = req.body;

    const company = await Company.findById(req.user.companyId);
    const exchangeRate = await getExchangeRate(currencyOriginal, company.currencyCode);
    const amountCompanyCurrency = amountOriginal * exchangeRate;

    // Create approver queue
    const approvers = [];
    let sequenceStep = 1;

    // Add manager if they have approval rights
    if (req.user.managerId) {
      const manager = await User.findById(req.user.managerId);
      if (manager && manager.isManagerApprover) {
        approvers.push({
          userId: manager._id,
          role: 'manager',
          sequenceStep: sequenceStep++,
          decision: 'pending'
        });
      }
    }

    // Add company-defined approval sequence
    for (const sequence of company.approvalSequences) {
      const approver = await User.findOne({ 
        companyId: req.user.companyId, 
        role: sequence.role 
      });
      if (approver) {
        approvers.push({
          userId: approver._id,
          role: sequence.role,
          sequenceStep: sequenceStep++,
          decision: 'pending'
        });
      }
    }

    const expense = new Expense({
      employeeId: req.user._id,
      companyId: req.user.companyId,
      amountOriginal,
      currencyOriginal,
      amountCompanyCurrency,
      category,
      description,
      date: new Date(date),
      receiptImagePath,
      extractedFields,
      approvers
    });

    await expense.save();
    await expense.populate('employeeId', 'name email');

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

app.get('/api/expenses', auth, async (req, res) => {
  try {
    let query = { companyId: req.user.companyId };

    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      
      query.$or = [
        { employeeId: { $in: teamMemberIds } },
        { 'approvers.userId': req.user._id, 'approvers.decision': 'pending' }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .populate('approvers.userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses/:id/approve', auth, async (req, res) => {
  try {
    const { decision, comment } = req.body;
    const expense = await Expense.findById(req.params.id).populate('companyId');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const approverIndex = expense.approvers.findIndex(
      approver => approver.userId.toString() === req.user._id.toString() && 
                  approver.decision === 'pending'
    );

    if (approverIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to approve this expense' });
    }

    expense.approvers[approverIndex].decision = decision;
    expense.approvers[approverIndex].comment = comment;
    expense.approvers[approverIndex].decidedAt = new Date();

    // Check conditional rules
    const company = expense.companyId;
    let shouldAutoApprove = false;

    for (const rule of company.conditionalRules) {
      if (rule.type === 'percentage') {
        const approvedCount = expense.approvers.filter(a => a.decision === 'approved').length;
        const totalApprovers = expense.approvers.length;
        if (approvedCount / totalApprovers >= rule.threshold) {
          shouldAutoApprove = true;
          break;
        }
      } else if (rule.type === 'specific') {
        const specificApprover = expense.approvers.find(
          a => a.role === rule.approverRole && a.decision === 'approved'
        );
        if (specificApprover) {
          shouldAutoApprove = true;
          break;
        }
      }
    }

    if (decision === 'rejected') {
      expense.status = 'rejected';
    } else if (shouldAutoApprove) {
      expense.status = 'approved';
    } else {
      const hasMoreApprovers = expense.approvers.some(a => a.decision === 'pending');
      if (!hasMoreApprovers) {
        expense.status = 'approved';
      }
    }

    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Failed to process approval' });
  }
});

// Exchange rates route
app.get('/api/exchange', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exchange rates' });
  }
});

// Analytics endpoints
app.get('/api/analytics/kpis', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    // Build base query
    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    // Apply role-based filtering
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    // Calculate KPIs
    const totalSpend = expenses.reduce((sum, exp) => sum + exp.amountCompanyCurrency, 0);
    const pendingApprovals = expenses.filter(exp => exp.status === 'pending').length;
    
    // Calculate average approval time
    const approvedExpenses = expenses.filter(exp => exp.status === 'approved');
    const avgApprovalTime = approvedExpenses.length > 0 
      ? approvedExpenses.reduce((sum, exp) => {
          const approvalTime = exp.approvers.find(a => a.decision === 'approved')?.decidedAt;
          if (approvalTime) {
            return sum + (approvalTime - exp.createdAt) / (1000 * 60 * 60); // hours
          }
          return sum;
        }, 0) / approvedExpenses.length
      : 0;

    // Calculate auto-approved percentage
    const autoApproved = expenses.filter(exp => {
      if (exp.status !== 'approved') return false;
      const company = expenses.find(e => e.companyId.toString() === exp.companyId.toString());
      // Check if any conditional rule was met
      return exp.approvers.some(approver => approver.decision === 'approved' && approver.comment?.includes('auto'));
    }).length;
    
    const autoApprovedPercentage = expenses.length > 0 ? (autoApproved / expenses.length) * 100 : 0;

    res.json({
      totalSpend,
      pendingApprovals,
      avgApprovalTime: Math.round(avgApprovalTime * 10) / 10,
      autoApprovedPercentage: Math.round(autoApprovedPercentage * 10) / 10,
      totalExpenses: expenses.length
    });
  } catch (error) {
    console.error('KPIs error:', error);
    res.status(500).json({ message: 'Failed to fetch KPIs' });
  }
});

app.get('/api/analytics/timeseries', auth, async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query).sort({ createdAt: 1 });
    
    // Group by time period
    const grouped = {};
    expenses.forEach(expense => {
      let key;
      const date = new Date(expense.createdAt);
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0, categories: {} };
      }
      
      grouped[key].total += expense.amountCompanyCurrency;
      grouped[key].count += 1;
      
      if (!grouped[key].categories[expense.category]) {
        grouped[key].categories[expense.category] = 0;
      }
      grouped[key].categories[expense.category] += expense.amountCompanyCurrency;
    });

    const timeseries = Object.entries(grouped).map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
      categories: data.categories
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(timeseries);
  } catch (error) {
    console.error('Timeseries error:', error);
    res.status(500).json({ message: 'Failed to fetch timeseries data' });
  }
});

app.get('/api/analytics/categories', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    const categoryData = {};
    expenses.forEach(expense => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = { total: 0, count: 0 };
      }
      categoryData[expense.category].total += expense.amountCompanyCurrency;
      categoryData[expense.category].count += 1;
    });

    const categories = Object.entries(categoryData).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / expenses.reduce((sum, exp) => sum + exp.amountCompanyCurrency, 0)) * 100
    })).sort((a, b) => b.total - a.total);

    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to fetch category data' });
  }
});

app.get('/api/analytics/top-merchants', auth, async (req, res) => {
  try {
    const { from, to, limit = 20 } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    const merchantData = {};
    expenses.forEach(expense => {
      const merchant = expense.extractedFields?.merchant || 'Unknown';
      if (!merchantData[merchant]) {
        merchantData[merchant] = { total: 0, count: 0, receipts: [] };
      }
      merchantData[merchant].total += expense.amountCompanyCurrency;
      merchantData[merchant].count += 1;
      merchantData[merchant].receipts.push({
        id: expense._id,
        amount: expense.amountCompanyCurrency,
        date: expense.createdAt,
        confidence: expense.extractedFields?.confidences?.merchant || 0
      });
    });

    const merchants = Object.entries(merchantData).map(([merchant, data]) => ({
      merchant,
      total: data.total,
      count: data.count,
      avgReceipt: data.total / data.count,
      receipts: data.receipts
    })).sort((a, b) => b.total - a.total).slice(0, parseInt(limit));

    res.json(merchants);
  } catch (error) {
    console.error('Top merchants error:', error);
    res.status(500).json({ message: 'Failed to fetch merchant data' });
  }
});

app.get('/api/analytics/approval-funnel', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    const funnel = {
      submitted: expenses.length,
      managerApproved: expenses.filter(exp => 
        exp.approvers.some(a => a.role === 'manager' && a.decision === 'approved')
      ).length,
      financeApproved: expenses.filter(exp => 
        exp.approvers.some(a => a.role === 'finance' && a.decision === 'approved')
      ).length,
      finalApproved: expenses.filter(exp => exp.status === 'approved').length,
      rejected: expenses.filter(exp => exp.status === 'rejected').length
    };

    res.json(funnel);
  } catch (error) {
    console.error('Approval funnel error:', error);
    res.status(500).json({ message: 'Failed to fetch approval funnel data' });
  }
});

app.get('/api/analytics/ocr-confidence', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { 
      companyId: req.user.companyId, 
      createdAt: { $gte: startDate, $lte: endDate },
      extractedFields: { $exists: true }
    };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    const confidenceData = expenses.map(expense => {
      const confidences = expense.extractedFields?.confidences || {};
      const avgConfidence = Object.values(confidences).reduce((sum, conf) => sum + conf, 0) / Object.keys(confidences).length;
      
      // Check if user edited the extracted fields (simplified check)
      const wasEdited = expense.description !== (expense.extractedFields?.merchant || '');
      
      return {
        id: expense._id,
        avgConfidence: avgConfidence || 0,
        wasEdited,
        merchant: expense.extractedFields?.merchant,
        amount: expense.amountCompanyCurrency,
        date: expense.createdAt
      };
    });

    res.json(confidenceData);
  } catch (error) {
    console.error('OCR confidence error:', error);
    res.status(500).json({ message: 'Failed to fetch OCR confidence data' });
  }
});

app.get('/api/analytics/outliers', auth, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = to ? new Date(to) : new Date();

    let query = { companyId: req.user.companyId, createdAt: { $gte: startDate, $lte: endDate } };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query);
    
    if (expenses.length === 0) {
      return res.json([]);
    }

    // Calculate mean and standard deviation
    const amounts = expenses.map(exp => exp.amountCompanyCurrency);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Find outliers (amount > mean + 3*stdDev)
    const outliers = expenses.filter(exp => 
      exp.amountCompanyCurrency > mean + 3 * stdDev
    ).map(expense => ({
      id: expense._id,
      amount: expense.amountCompanyCurrency,
      description: expense.description,
      employee: expense.employeeId,
      date: expense.createdAt,
      category: expense.category,
      merchant: expense.extractedFields?.merchant,
      confidence: expense.extractedFields?.confidences?.merchant || 0
    }));

    res.json(outliers);
  } catch (error) {
    console.error('Outliers error:', error);
    res.status(500).json({ message: 'Failed to fetch outlier data' });
  }
});

app.post('/api/analytics/export', auth, async (req, res) => {
  try {
    const { format = 'csv', from, to, filters = {} } = req.body;
    
    let query = { companyId: req.user.companyId };
    
    if (from && to) {
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) };
    }
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        companyId: req.user.companyId, 
        managerId: req.user._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .populate('approvers.userId', 'name email role')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvData = expenses.map(expense => ({
        Date: expense.createdAt.toISOString().split('T')[0],
        Employee: expense.employeeId.name,
        Amount: expense.amountCompanyCurrency,
        Currency: expense.currencyOriginal,
        Category: expense.category,
        Description: expense.description,
        Status: expense.status,
        Merchant: expense.extractedFields?.merchant || '',
        Confidence: expense.extractedFields?.confidences?.merchant || 0
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
      
      const csv = [
        Object.keys(csvData[0] || {}).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csv);
    } else {
      res.json(expenses);
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});
