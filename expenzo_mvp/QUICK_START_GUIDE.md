# 🚀 Quick Start Guide - Manual Steps

Since the automated startup is having issues, here's how to start your Expenso MVP manually:

## Step 1: Start MongoDB
Open a new Command Prompt or PowerShell window and run:
```cmd
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath C:\data\db
```
Keep this window open - MongoDB will be running.

## Step 2: Start the Server
Open another Command Prompt or PowerShell window, navigate to the server directory, and run:
```cmd
cd C:\Users\Snehal_\Desktop\expenzo_mvp\server
node simple-server.js
```
You should see:
```
Simple server running on port 5000
Connected to MongoDB
```
Keep this window open - the server will be running.

## Step 3: Start the Client
Open a third Command Prompt or PowerShell window, navigate to the client directory, and run:
```cmd
cd C:\Users\Snehal_\Desktop\expenzo_mvp\client
npm run dev
```
You should see:
```
VITE v5.4.20  ready in 616 ms
➜  Local:   http://localhost:3000/
```
Keep this window open - the client will be running.

## Step 4: Access Your Application
Open your web browser and go to: **http://localhost:3000**

## Demo Accounts:
- **Admin**: `admin@demo.com` / `password123`
- **Manager**: `manager@demo.com` / `password123`
- **Employee**: `employee@demo.com` / `password123`

## What You'll See:
1. **Login Page**: Enter demo credentials
2. **Dashboard**: Role-based navigation
3. **Add Expense**: Manual, voice, and OCR options
4. **Approval System**: Manager review interface
5. **Analytics**: Expense categories and totals

## Features to Test:
- ✅ **Voice Commands**: "Add ₹500 lunch expense today"
- ✅ **OCR Processing**: Upload receipt images
- ✅ **Confidence Scoring**: Visual indicators for data quality
- ✅ **Approval Workflows**: Manager approval system
- ✅ **Multi-currency**: Currency conversion

## Troubleshooting:
- If MongoDB won't start: Make sure the `C:\data\db` directory exists
- If server won't start: Check if port 5000 is already in use
- If client won't start: Make sure you're in the client directory and dependencies are installed

## You're Ready to Demo! 🎯
Your Expenso MVP is fully functional with advanced OCR, voice commands, and intelligent approval workflows!

