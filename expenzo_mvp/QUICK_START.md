# 🚀 Expenso MVP - Quick Start Guide

## ✅ Current Status
- ✅ MongoDB installed and running
- ✅ Database seeded with demo data
- ✅ Server running on http://localhost:5000
- ✅ Client running on http://localhost:3000

## 🎯 Demo Accounts Ready
- **Admin**: `admin@demo.com` / `password123`
- **Manager**: `manager@demo.com` / `password123`
- **Employee**: `employee@demo.com` / `password123`

## 🌐 Access Your Application
Open your browser and go to: **http://localhost:3000**

## 🎬 Demo Flow (2-3 minutes)

### 1. Admin Setup (30s)
- Login as admin: `admin@demo.com` / `password123`
- Create new users (Manager, Employee)
- Set manager as approver

### 2. Employee Features (60s)
- Login as employee: `employee@demo.com` / `password123`
- **Voice Command**: Click mic, say "Add ₹250 lunch expense today"
- **OCR Upload**: Upload a receipt image, see confidence scores
- Submit expenses

### 3. Manager Approval (60s)
- Login as manager: `manager@demo.com` / `password123`
- View pending approvals
- Review OCR results with confidence bars
- Approve/reject with comments

### 4. Analytics (30s)
- View dashboard with expense categories
- See approval workflows in action

## 🔧 Troubleshooting

**If server shows "Server error during login":**
1. Check MongoDB is running: `mongod --dbpath C:\data\db`
2. Check server is running: `cd server && node server.js`
3. Verify .env file exists with correct MongoDB URI

**If voice commands don't work:**
- Use Chrome browser
- Allow microphone permissions
- Try: "Add ₹500 lunch expense today"

**If OCR is slow:**
- Use clear, high-contrast receipt images
- Reduce image size before upload
- Wait for processing to complete

## 🎯 Key Features to Demo

1. **Confidence-Based OCR**: Show confidence scores (green >80%, yellow 50-80%, red <50%)
2. **Voice Commands**: Natural language expense creation
3. **Smart Approval**: Conditional rules and percentage thresholds
4. **Real-time Processing**: Instant OCR and approval workflows
5. **Multi-currency**: Automatic currency conversion

## 📱 Mobile Testing
The app is responsive and works on mobile devices. Voice commands are particularly useful on mobile!

## 🚀 Ready to Demo!
Your Expenso MVP is now fully functional and ready to impress judges with its advanced OCR, voice commands, and intelligent approval workflows!

