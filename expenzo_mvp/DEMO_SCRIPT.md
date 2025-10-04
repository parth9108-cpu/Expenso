# Expenso MVP - Demo Script (2-3 minutes)

## Pre-Demo Setup
1. Start the application: `npm run dev`
2. Seed demo data: `cd server && npm run seed`
3. Open browser to http://localhost:3000
4. Use Chrome for best voice recognition support

## Demo Flow

### 1. Admin Setup (30 seconds)
**"Let me show you how easy it is to set up a company and start managing expenses."**

- Click "Sign up" 
- Fill form:
  - Name: "Demo Admin"
  - Email: "admin@demo.com" 
  - Password: "password123"
  - Company: "TechCorp"
  - Country: "India" (shows currency auto-selection)
- Click "Create account"
- **Highlight**: "Notice how the system automatically selected INR currency based on India"

### 2. Employee Features (60 seconds)
**"Now let's see how employees can add expenses in three different ways."**

#### Voice Command Demo
- Login as employee: `employee@demo.com` / `password123`
- Click "Add Expense"
- Click "Start Voice Input" 
- Say: **"Add ₹250 lunch expense today"**
- **Highlight**: "Watch how the form auto-fills with amount, category, and date"
- Click "Create Expense"

#### OCR Receipt Demo
- Click "Add Expense" again
- Click "Upload Receipt" 
- Upload a sample receipt image (prepare a clear receipt)
- **Highlight**: "The system preprocesses the image, runs OCR, and extracts fields with confidence scores"
- Show confidence bars (green >80%, yellow 50-80%, red <50%)
- Click "Use Extracted Data"
- **Highlight**: "You can edit any field before submitting - full transparency"
- Click "Create Expense"

### 3. Manager Approval (60 seconds)
**"Now let's see the approval workflow from a manager's perspective."**

- Login as manager: `manager@demo.com` / `password123`
- Click "Pending Approvals"
- **Highlight**: "Managers see all expenses requiring their approval with OCR confidence scores"
- Click "Review" on an expense
- **Highlight**: "Full context - original receipt, extracted data, confidence scores, approval history"
- Click "Approve" and add comment: "Approved for team lunch"
- **Highlight**: "The system tracks the complete approval trail"

#### Conditional Rules Demo
- **Highlight**: "Our approval engine supports conditional rules"
- Show percentage rule: "When 60% of approvers approve, expense is auto-approved"
- **Highlight**: "This reduces approval bottlenecks while maintaining control"

### 4. Analytics & Summary (30 seconds)
**"Finally, let's see the analytics and overall system benefits."**

- Login as admin: `admin@demo.com` / `password123`
- Show dashboard with expense categories
- **Highlight**: "Real-time analytics and expense categorization"

## Key Differentiators to Emphasize

### 1. **Confidence-First OCR**
- "Unlike basic OCR tools, we show confidence scores for every extracted field"
- "Users can see exactly how reliable the data is and edit as needed"
- "This transparency builds trust in automated processes"

### 2. **Voice Commands**
- "Natural language expense creation - just speak naturally"
- "Works with common phrases like 'Add ₹500 lunch expense today'"
- "Perfect for mobile and hands-free scenarios"

### 3. **Smart Approval Rules**
- "Flexible approval workflows - sequential, conditional, or hybrid"
- "Percentage-based rules reduce bottlenecks"
- "Specific role rules for high-value approvals"

### 4. **Client-Side Processing**
- "No external OCR services needed - faster and more private"
- "Works offline, no data leaves your browser"
- "Lower costs, better performance"

## Demo Tips

### Preparation
- Have a clear receipt image ready for upload
- Test voice recognition in the demo environment
- Ensure all three user accounts are created
- Have sample expenses in different statuses

### During Demo
- Speak clearly for voice commands
- Emphasize the confidence scores and transparency
- Show the side-by-side original vs processed images
- Highlight the real-time nature of approvals

### Backup Plans
- If voice doesn't work: "Let me show you the manual entry instead"
- If OCR is slow: "The system is processing the image - this is normal for first-time uploads"
- If network issues: "The system works offline for most features"

## Closing Statement

**"Expenso MVP demonstrates how modern expense management can be both powerful and user-friendly. With confidence-based OCR, voice commands, and intelligent approval workflows, we've created a system that saves time while maintaining accuracy and control. The client-side processing ensures privacy and performance, while the flexible approval engine adapts to any organization's needs."**

## Q&A Preparation

### Common Questions

**Q: How accurate is the OCR?**
A: "We show confidence scores for transparency. High-confidence extractions (>80%) are typically very accurate, while lower scores prompt user review. The preprocessing improves accuracy significantly."

**Q: What about security?**
A: "All processing happens client-side, so receipt data never leaves the user's browser. We use JWT authentication and encrypt sensitive data in transit."

**Q: Can it handle multiple currencies?**
A: "Yes, with real-time exchange rate conversion. Users can submit in any currency, and the system converts to company currency for reporting."

**Q: How does it scale?**
A: "The modular architecture supports easy scaling. OCR can be moved server-side for high-volume scenarios, and the approval engine handles complex workflows."

**Q: What about mobile support?**
A: "The responsive design works on all devices. Voice commands are particularly useful on mobile for quick expense entry."

