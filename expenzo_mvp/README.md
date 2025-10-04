# Expenso MVP - Expense Management System

A comprehensive expense management system with OCR, voice commands, and intelligent approval workflows.

## Features

- **Multi-input Expense Creation**: Manual entry, voice commands, and receipt upload
- **Advanced OCR Processing**: Image preprocessing + Tesseract OCR with confidence scoring
- **Voice Commands**: Speech-to-text expense creation with natural language parsing
- **Smart Approval Workflows**: Sequential and conditional approval rules
- **Real-time Currency Conversion**: Multi-currency support with live exchange rates
- **Confidence-based UI**: Transparent OCR results with inline editing

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **OCR**: Tesseract.js (client-side)
- **Voice**: Web Speech API
- **Image Processing**: OpenCV.js (client-side)

## Quick Start

### Prerequisites

- Node.js 16+ 
- MongoDB (local or Atlas)
- Modern browser with Speech Recognition support (Chrome recommended)

### Installation

1. **Clone and install dependencies**:
```bash
npm run install-all
```

2. **Set up environment variables**:
```bash
# Copy .env file and update values
cp .env.example .env
```

3. **Start MongoDB** (if using local):
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

4. **Start the application**:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

### Demo Setup

1. **Sign up as Admin**: Create your company account
2. **Create Users**: Add Manager and Employee accounts
3. **Test Features**:
   - Voice: "Add ₹500 lunch expense today"
   - OCR: Upload a receipt image
   - Approval: Manager approves pending expenses

## Project Structure

```
expenzo_mvp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/         # OCR, voice, preprocessing utilities
│   │   └── services/      # API services
├── server/                # Express backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── middleware/       # Auth middleware
└── package.json          # Root package with scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses
- `POST /api/expenses/:id/approve` - Approve/reject expense

### Users
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)

## Demo Script (2-3 minutes)

1. **Admin Setup** (30s)
   - Sign up with company details
   - Create Manager (enable approver) and Employee

2. **Employee Features** (60s)
   - Voice: "Add ₹250 lunch expense today" → auto-fill form
   - Upload receipt → OCR panel → confidence scores → submit

3. **Manager Approval** (60s)
   - View pending approvals
   - Review OCR results with confidence bars
   - Approve with comments
   - Show conditional rules (percentage threshold)

4. **Analytics** (30s)
   - Dashboard with expense categories
   - Total spend overview

## Key Features Explained

### OCR Pipeline
1. **Image Preprocessing**: Deskew, contrast enhancement, noise reduction
2. **Tesseract OCR**: Text extraction with word-level confidence
3. **Field Extraction**: Amount, date, merchant parsing with regex
4. **Confidence Scoring**: Visual indicators for data quality
5. **Inline Editing**: Edit extracted fields before submission

### Voice Commands
- **Natural Language**: "Add ₹500 lunch expense today"
- **Parsing**: Amount, category, date extraction
- **Auto-fill**: Populate form fields automatically
- **Feedback**: Speech synthesis confirmation

### Approval Engine
- **Sequential**: Manager → Finance → Director
- **Conditional**: Percentage rules (60% approval) or specific roles (CFO)
- **Real-time**: Status updates and notifications
- **Audit Trail**: Complete approval history

## Troubleshooting

### Common Issues

1. **Speech Recognition not working**:
   - Use Chrome browser
   - Ensure microphone permissions
   - Check HTTPS in production

2. **OCR slow performance**:
   - Reduce image size before upload
   - Use clear, high-contrast receipts
   - Consider server-side OCR for production

3. **MongoDB connection issues**:
   - Check MongoDB service is running
   - Verify connection string in .env
   - Ensure network access for Atlas

### Performance Tips

- **Image Optimization**: Resize images to 800x600 max
- **OCR Caching**: Cache processed images for repeated use
- **Lazy Loading**: Load expense lists in batches
- **CDN**: Use CDN for static assets in production

## Production Deployment

1. **Environment Setup**:
   - Set NODE_ENV=production
   - Use MongoDB Atlas
   - Configure JWT secrets
   - Set up SSL certificates

2. **Build Process**:
   ```bash
   cd client && npm run build
   cd ../server && npm start
   ```

3. **Scaling Considerations**:
   - Move OCR to server-side service
   - Implement Redis for session management
   - Add rate limiting and monitoring
   - Use cloud storage for receipt images

## License

MIT License - see LICENSE file for details.

